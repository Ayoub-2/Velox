const https = require('https');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const HTTPS_PORT = 3443;
const APP_PORT = 3000;
const SSL_KEY = '/app/certs/server.key';
const SSL_CRT = '/app/certs/server.crt';

// 1. Check for Certificates
if (!fs.existsSync(SSL_KEY) || !fs.existsSync(SSL_CRT)) {
    console.log('⚠️  SSL Certificates not found. Starting app directly on port 3000...');

    // Pass-through: Just run the server script on port 3000
    const app = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '3000' }
    });

    app.on('exit', (code) => process.exit(code));
    process.on('SIGTERM', () => app.kill('SIGTERM'));
    process.on('SIGINT', () => app.kill('SIGINT'));

} else {
    console.log(`🔒 Starting SSL Proxy on port ${HTTPS_PORT} -> App on port ${APP_PORT}`);

    // 2. Start Application (Child Process)
    const app = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: APP_PORT.toString(), HOSTNAME: '0.0.0.0' }
    });

    app.on('exit', (code) => {
        console.log(`App exited with code ${code}`);
        process.exit(code);
    });

    // Handle Signals
    process.on('SIGTERM', () => app.kill('SIGTERM'));
    process.on('SIGINT', () => app.kill('SIGINT'));

    // 3. Start HTTPS Proxy
    const options = {
        key: fs.readFileSync(SSL_KEY),
        cert: fs.readFileSync(SSL_CRT)
    };

    const server = https.createServer(options, (req, res) => {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: APP_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers,
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (e) => {
            console.error(`Proxy Error: ${e.message}`);
            res.writeHead(502);
            res.end('Bad Gateway');
        });

        req.pipe(proxyReq, { end: true });
    });

    // WebSocket Support (Upgrade)
    server.on('upgrade', (req, socket, head) => {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: APP_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers,
        });

        proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
            // Success, pipe sockets
            let response = `HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
            for (let i = 0; i < proxyRes.rawHeaders.length; i += 2) {
                response += `${proxyRes.rawHeaders[i]}: ${proxyRes.rawHeaders[i + 1]}\r\n`;
            }
            response += '\r\n';
            socket.write(response);
            if (proxyHead && proxyHead.length) socket.write(proxyHead);

            socket.pipe(proxySocket);
            proxySocket.pipe(socket);
        });

        proxyReq.on('error', (e) => {
            socket.destroy();
        });

        proxyReq.end();
    });

    server.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`✅ HTTPS Proxy listening on port ${HTTPS_PORT}`);
    });
}
