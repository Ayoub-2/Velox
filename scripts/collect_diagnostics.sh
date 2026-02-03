#!/bin/bash
# scripts/collect_diagnostics.sh
# Collects logs, stats, and config for troubleshooting.
# USAGE: ./collect_diagnostics.sh [OUTPUT_DIR]

# Default output directory
OUTPUT_DIR="${1:-./reports/diagnostics}"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUNDLE_DIR="$OUTPUT_DIR/diag_$TIMESTAMP"
mkdir -p "$BUNDLE_DIR"

echo "[*] collecting diagnostics to $BUNDLE_DIR..."

# 1. System Info
echo "   - Capturing system info..."
uname -a > "$BUNDLE_DIR/system_info.txt"
uptime >> "$BUNDLE_DIR/system_info.txt"
docker info > "$BUNDLE_DIR/docker_info.txt" 2>&1

# 2. Docker Status
echo "   - Capturing container status..."
docker compose ps > "$BUNDLE_DIR/docker_ps.txt"
docker stats --no-stream > "$BUNDLE_DIR/docker_stats.txt"

# 3. Logs (Last 1000 lines)
echo "   - Dumping service logs..."
services=("web" "api" "worker" "beat" "zap" "redis" "db")
for svc in "${services[@]}"; do
    docker compose logs --tail=1000 "$svc" > "$BUNDLE_DIR/${svc}.log" 2>&1
done

# 4. Network Connectivity (Dry Run)
echo "   - Running connectivity check..."
# We use the script if it exists and is executable
if [ -x "./scripts/verify_connectivity.sh" ]; then
    ./scripts/verify_connectivity.sh > "$BUNDLE_DIR/connectivity_check.txt" 2>&1
else
    echo "Scripts not found or not executable" > "$BUNDLE_DIR/connectivity_check.txt"
fi

# 5. Compress
echo "   - Compressing bundle..."
TAR_FILE="$OUTPUT_DIR/diag_$TIMESTAMP.tar.gz"
tar -czf "$TAR_FILE" -C "$OUTPUT_DIR" "diag_$TIMESTAMP"
rm -rf "$BUNDLE_DIR"

echo "✅ Diagnostics bundle created: $TAR_FILE"

# 6. Retention Policy (Clean up older than 7 days)
echo "   - Cleaning up old bundles (>7 days)..."
find "$OUTPUT_DIR" -name "diag_*.tar.gz" -mtime +7 -delete
