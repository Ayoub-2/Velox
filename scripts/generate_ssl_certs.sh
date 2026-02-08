#!/bin/bash
# scripts/generate_ssl_certs.sh
# Generates a self-signed SSL certificate with SAN (Subject Alternative Name) support.
# Usage: ./scripts/generate_ssl_certs.sh [SERVER_IP] [DOMAIN_NAME]

# Defaults
SERVER_IP="${1}"
DOMAIN_NAME="${2:-velox.local}"
CERTS_DIR="./certs"

if [ -z "$SERVER_IP" ]; then
    echo "Usage: ./scripts/generate_ssl_certs.sh <SERVER_IP> [DOMAIN_NAME]"
    echo "Example: ./scripts/generate_ssl_certs.sh 10.2.4.5 velox.internal"
    exit 1
fi

# Check for openssl
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: 'openssl' is not installed."
    exit 1
fi

mkdir -p "$CERTS_DIR"

echo "========================================="
echo " Generating SSL Certificates"
echo " IP:     $SERVER_IP"
echo " Domain: $DOMAIN_NAME"
echo " Dir:    $CERTS_DIR"
echo "========================================="

# Create OpenSSL Config for SANs
cat > "$CERTS_DIR/openssl.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Velox Security
OU = IT
CN = $DOMAIN_NAME

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = $SERVER_IP
DNS.1 = $DOMAIN_NAME
DNS.2 = localhost
EOF

# Generate Key and Certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$CERTS_DIR/server.key" \
  -out "$CERTS_DIR/server.crt" \
  -config "$CERTS_DIR/openssl.cnf" \
  -extensions v3_req

# Cleanup Config
rm "$CERTS_DIR/openssl.cnf"

# Set Permissions (Readable by World/Container)
chmod 644 "$CERTS_DIR/server.key"
chmod 644 "$CERTS_DIR/server.crt"

echo ""
echo "✅ Certificates generated successfully in $CERTS_DIR/"
echo "   - $CERTS_DIR/server.key"
echo "   - $CERTS_DIR/server.crt"
echo ""
echo "To Apply:"
echo "1. Ensure docker-compose.yml has the './certs:/app/certs:ro' volume mounted."
echo "2. Restart the container: docker compose restart web"
