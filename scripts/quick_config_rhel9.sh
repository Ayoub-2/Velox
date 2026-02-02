#!/bin/bash
# Velox - RHEL 9 Quick Configuration Script
# Prepares the environment for Docker Deployment:
# 1. Configures Firewall (Ports 3000, 8000)
# 2. Sets SELinux Contexts for Volumes
#
# Usage: sudo ./quick_config_rhel9.sh

set -e

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

echo "[*] Velox RHEL 9 Environment Setup"
echo "------------------------------------"

# 1. Firewall Configuration
echo "[*] Configuring Firewall..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=8000/tcp
    firewall-cmd --reload
    echo "    ✅ Ports 3000 (Web) and 8000 (API) opened."
else
    echo "    ⚠️ 'firewall-cmd' not found. Skipping firewall config."
fi

# 2. SELinux Contexts
echo "[*] Setting SELinux Contexts for Volumes..."
# Ensure directories exist in the current folder (project root)
mkdir -p knowledge-base reports backups

if command -v chcon &> /dev/null; then
    chcon -Rt svirt_sandbox_file_t knowledge-base
    chcon -Rt svirt_sandbox_file_t reports
    chcon -Rt svirt_sandbox_file_t backups
    echo "    ✅ SELinux contexts updated for ./knowledge-base, ./reports, ./backups"
else
    echo "    ⚠️ 'chcon' not found. Skipping SELinux config."
fi

echo "------------------------------------"
echo "[+] Configuration Complete!"
echo "    You can now run: docker compose up -d"
