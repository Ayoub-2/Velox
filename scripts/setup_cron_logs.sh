#!/bin/bash
# scripts/setup_cron_logs.sh
# Sets up a cron job to run collect_diagnostics.sh daily at midnight.

PROJECT_DIR=$(pwd)
SCRIPT_PATH="$PROJECT_DIR/scripts/collect_diagnostics.sh"
LOG_PATH="$PROJECT_DIR/reports/cron_diagnostics.log"

# Validate script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: $SCRIPT_PATH not found."
    exit 1
fi

chmod +x "$SCRIPT_PATH"

# Cron Expression: 0 0 * * * (Daily at Midnight)
CRON_JOB="0 0 * * * $SCRIPT_PATH >> $LOG_PATH 2>&1"

echo "========================================="
echo " Cron Job Setup"
echo "========================================="
echo "Proposed Cron Entry:"
echo "$CRON_JOB"
echo ""

# Check if already exists
if crontab -l 2>/dev/null | grep -q "$SCRIPT_PATH"; then
    echo "⚠️  Cron job already exists for this script."
else
    echo -n "[?] Install this cron job? (y/N): "
    read answer
    if [[ "$answer" =~ ^[Yy]$ ]]; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✅ Cron job installed."
    else
        echo "Conversion cancelled."
    fi
fi
