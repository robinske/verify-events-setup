#!/bin/bash

# Local testing script for Verify Events webhook
# This sends sample events to your local server for testing

PORT=${PORT:-3000}
URL="http://localhost:$PORT/events"

echo "Testing Verify Events webhook at $URL"
echo ""

if ! curl -s "http://localhost:$PORT/" > /dev/null; then
    echo "❌ Server is not running on port $PORT"
    echo "Start the server with: npm start"
    exit 1
fi

echo "✓ Server is running"
echo ""
echo "Sending sample events..."

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d @fixtures/sample-events.json

echo ""
echo ""
echo "Check the server logs above for processed events"
