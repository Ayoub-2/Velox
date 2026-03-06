#!/usr/bin/env bash
# scripts/setup_rh_dns.sh
# Detects RHEL/CentOS internal DNS and exports to a docker-compose.override.yml
# Required for Docker on RHEL to inherit internal DNS natively.

set -euo pipefail

OVERRIDE_FILE="docker-compose.override.yml"
DNS_REGEX="^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$"

echo "Detecting Red Hat Internal DNS..."

# Function to get DNS
get_dns() {
  if command -v nmcli >/dev/null 2>&1; then
    nmcli dev show | grep IP4.DNS | awk '{print $2}' || true
  elif [ -f /run/systemd/resolve/resolv.conf ]; then
    grep "^nameserver" /run/systemd/resolve/resolv.conf | awk '{print $2}' || true
  elif [ -f /etc/resolv.conf ]; then
    # Filter out local loopbacks which docker can't use
    grep "^nameserver" /etc/resolv.conf | awk '{print $2}' | grep -v "^127\." || true
  fi
}

# Capture DNS servers into an array
DNS_SERVERS=($(get_dns))

if [ ${#DNS_SERVERS[@]} -eq 0 ]; then
    echo "ERROR: Failed to detect any valid upstream DNS servers."
    echo "This will cause Docker to default to public DNS (8.8.8.8) and break internal scans."
    echo "Aborting deployment override to fail safely (User Global Rule 39)."
    exit 1
fi

PRIMARY_DNS=${DNS_SERVERS[0]}
SECONDARY_DNS=${DNS_SERVERS[1]:-$PRIMARY_DNS}

# Validate formats (User Global Rule 15 & 16)
if ! [[ "$PRIMARY_DNS" =~ $DNS_REGEX ]] || ! [[ "$SECONDARY_DNS" =~ $DNS_REGEX ]]; then
    echo "ERROR: Extracted DNS servers do not match IPv4 format. Potential injection or parse error."
    echo "Primary: $PRIMARY_DNS | Secondary: $SECONDARY_DNS"
    exit 1
fi

# Generate the override file
cat <<EOF > "$OVERRIDE_FILE"
services:
  web:
    dns:
      - "$PRIMARY_DNS"
      - "$SECONDARY_DNS"
  api:
    dns:
      - "$PRIMARY_DNS"
      - "$SECONDARY_DNS"
  worker:
    dns:
      - "$PRIMARY_DNS"
      - "$SECONDARY_DNS"
  beat:
    dns:
      - "$PRIMARY_DNS"
      - "$SECONDARY_DNS"
  zap:
    dns:
      - "$PRIMARY_DNS"
      - "$SECONDARY_DNS"
EOF

# Secure permissions
chmod 600 "$OVERRIDE_FILE"

echo "Success! Configured $OVERRIDE_FILE with DNS=$PRIMARY_DNS and Secondary=$SECONDARY_DNS"
