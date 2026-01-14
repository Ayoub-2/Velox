#!/bin/bash

# Velox - Security by Design Knowledge Base - RHEL 9 Installer
# Usage: sudo ./install_rhel9.sh

set -e

echo "[*] Starting Installation on RHEL 9..."

# 1. Install Node.js 20
echo "[*] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# 2. Build Application
echo "[*] Building the application..."
# Assuming we are in the project root
if [ ! -f "package.json" ]; then
    echo "[!] Error: package.json not found. Please run this from the project root."
    exit 1
fi

npm ci
npm run build

# 3. Create System User
echo "[*] Creating 'sbd' system user..."
if ! id "sbd" &>/dev/null; then
    sudo useradd -r -s /bin/false sbd
fi

# 4. Set Permissions
echo "[*] Setting permissions..."
# Create a deployment directory if not exists
sudo mkdir -p /opt/sbd
sudo cp -r .next public package.json node_modules /opt/sbd/
sudo chown -R sbd:sbd /opt/sbd

# 5. Create Systemd Service
echo "[*] Creating Systemd Service..."
cat <<EOF | sudo tee /etc/systemd/system/security-kb.service
[Unit]
Description=Security by Design Knowledge Base
After=network.target

[Service]
Type=simple
User=sbd
Group=sbd
WorkingDirectory=/opt/sbd
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# 6. Enable Firewall
echo "[*] Configuring Firewall..."
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# 7. Start Service
echo "[*] Starting Service..."
sudo systemctl daemon-reload
sudo systemctl enable --now security-kb

echo "[+] Installation Complete! App running on port 3000."
