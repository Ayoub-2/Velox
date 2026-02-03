#!/bin/bash
# scripts/monitor_tasks.sh
# Checks the health of the Async Task Queue (Redis/Celery)

echo "========================================="
echo " Velox Task Queue Monitor"
echo "========================================="

# 1. Redis Health
echo -n "[*] Checking Redis Connection: "
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ UP"
else
    echo "❌ DOWN"
    exit 1
fi

# 2. Queue Depth
echo -n "[*] Pending Tasks (Queue Depth): "
QUEUE_LEN=$(docker compose exec -T redis redis-cli llen celery)
echo "$QUEUE_LEN"
if [ "$QUEUE_LEN" -gt 100 ]; then
    echo "    ⚠️  High queue depth! Check if workers are running."
fi

# 3. Worker Status
echo "[*] Checking Workers:"
# We run the status command from within the api or worker container
if docker compose exec -T worker celery -A celery_app status 2>/dev/null; then
    echo "    ✅ Workers Online"
else
    echo "    ❌ No Workers Found or Unreachable"
fi
