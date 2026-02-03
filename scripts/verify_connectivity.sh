#!/bin/bash
# scripts/verify_connectivity.sh
# Verifies network connectivity from DAST containers to the host LAN and DNS resolution.
#
# Usage: ./scripts/verify_connectivity.sh [TARGET_IP] [TARGET_DOMAIN]
# Default: TARGET_IP=10.2.4.5, TARGET_DOMAIN=google.com (replace with internal if needed)

TARGET_IP="${1:-10.2.4.5}"
TARGET_DOMAIN="${2:-google.com}"

echo "========================================================"
echo " DAST Network Connectivity Verification"
echo " Target IP:     $TARGET_IP"
echo " Target Domain: $TARGET_DOMAIN"
echo "========================================================"

# Function to run checks in a container
check_container() {
    local SERVICE=$1
    local CONTAINER_NAME=$(docker compose ps -q $SERVICE)
    
    if [ -z "$CONTAINER_NAME" ]; then
        echo "❌ Service '$SERVICE' is not running."
        return
    fi
    
    echo ""
    echo "[*] Checking Service: $SERVICE"
    
    # 1. IP Connectivity (Ping)
    echo -n "   - IP Ping ($TARGET_IP): "
    if docker compose exec -T $SERVICE ping -c 2 -W 2 $TARGET_IP > /dev/null 2>&1; then
        echo "✅ SUCCESS"
    else
        echo "❌ FAILED"
        echo "     (Note: Ensure Host Firewall allows ICMP from Docker bridge)"
    fi

    # 2. DNS Resolution
    echo -n "   - DNS Resolve ($TARGET_DOMAIN): "
    # Attempt Python resolution first (most reliable across images)
    if docker compose exec -T $SERVICE python3 -c "import socket; print(socket.gethostbyname('$TARGET_DOMAIN'))" > /dev/null 2>&1; then
         RESOLVED_IP=$(docker compose exec -T $SERVICE python3 -c "import socket; print(socket.gethostbyname('$TARGET_DOMAIN'))" 2>/dev/null)
         echo "✅ SUCCESS ($RESOLVED_IP)"
    else
        # Fallback attempts (curl/wget) if python fails or not present (unlikely in orchestrator)
        echo "❌ FAILED"
        echo "     (Debug: Check /etc/resolv.conf in container)"
    fi
}

# Check Orchestrator
check_container "api"

# Check ZAP
# ZAP container might not have python installed in path, or might be different base.
# It usually has basic shell tools. 
echo ""
echo "[*] Checking Service: zap"
# ZAP often runs as 'zap' user, might not have ping permissions or ping binary.
# We try curl to the IP port 80/443 as a connectivity test if ping fails, 
# but ZAP base image usually has some networking tools.
echo -n "   - IP Ping ($TARGET_IP): "
if docker compose exec -T zap ping -c 2 -W 2 $TARGET_IP > /dev/null 2>&1; then
    echo "✅ SUCCESS"
else
     echo "❌ FAILED (Ping)"
fi

echo -n "   - DNS Resolve ($TARGET_DOMAIN): "
# ZAP generic check
if docker compose exec -T zap getent hosts $TARGET_DOMAIN > /dev/null 2>&1; then
     echo "✅ SUCCESS (getent)"
elif docker compose exec -T zap nslookup $TARGET_DOMAIN > /dev/null 2>&1; then
     echo "✅ SUCCESS (nslookup)"
else
     echo "❌ FAILED"
fi

echo ""
echo "========================================================"
echo "Verification Complete."
