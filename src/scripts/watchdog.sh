#!/bin/sh
set -eu

# Config
HEARTBEAT_PATH=${HEARTBEAT_PATH:-/app/data/heartbeat.json}
LIVENESS_WINDOW_SEC=${LIVENESS_WINDOW_SEC:-600} # 10 minutes default

# Start app in background
node /app/src/index.js &
APP_PID=$!

echo "watchdog: started app pid=$APP_PID, monitoring $HEARTBEAT_PATH"

while true; do
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "watchdog: app exited"
    exit 1
  fi

  if [ -f "$HEARTBEAT_PATH" ]; then
    NOW=$(date +%s)
    HB_TS=$(date -r "$HEARTBEAT_PATH" +%s 2>/dev/null || echo 0)
    AGE=$((NOW - HB_TS))
    if [ "$AGE" -gt "$LIVENESS_WINDOW_SEC" ]; then
      echo "watchdog: heartbeat stale (${AGE}s > ${LIVENESS_WINDOW_SEC}s)"
      kill "$APP_PID" 2>/dev/null || true
      exit 1
    fi
  fi

  sleep 30
done


