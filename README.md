# Twilio Verify Events - SMS Delivery Tracking

Webhook server example for tracking SMS delivery status with Twilio Verify Events. Demonstrates how to receive real-time message status updates (`sent`, `delivered`, `failed`, `undelivered`) for Verify SMS verifications.

## Overview

Twilio Verify Events provides real-time message status updates through Event Streams. This repository shows how to:
- Set up an Event Streams webhook sink and subscription
- Receive and process Verify message status events
- Test locally without sending real SMS

**Key Difference:** The Verify API response tells you a verification was *created*, not whether it was *delivered*. Delivery status arrives asynchronously through Verify Events.

## Features

- ✅ Complete webhook server implementation
- ✅ Automated Event Streams setup/teardown scripts
- ✅ Local testing with fixture events (no real SMS required)
- ✅ Real-time event logging and inspection
- ✅ Minimal code focused on the core integration pattern

## Prerequisites

- Node.js 16+
- Twilio account with Verify enabled
- Verify Service SID
- ngrok (or another tunneling tool for local development)

## Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd verify-events-test
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WEBHOOK_URL=https://your-domain.ngrok.io/events
```

## Quick Start

### 1. Expose your local server

```bash
ngrok http 3000
# Copy the HTTPS URL to WEBHOOK_URL in .env
```

### 2. Create Event Streams resources

```bash
npm run setup
# Add the returned SIDs to your .env file
```

### 3. Enable Verify Events

In [Twilio Console](https://console.twilio.com) → Verify → Services → Your Service → General:
- Enable **"Verify Events subscribed service"**

### 4. Start the webhook server

```bash
npm start
```

### 5. Send a test verification

```bash
node send-test-verification.js +15551234567
```

Watch the webhook logs for events arriving in real-time.

## Usage

### Scripts

```bash
npm start              # Start webhook server (port 3000)
npm run setup          # Create Event Streams sink and subscription
npm run teardown       # Delete Event Streams resources
npm test               # Send fixture events to local server
./test-local.sh        # Alternative local testing script
```

### Testing locally (without real SMS)

```bash
npm start              # Terminal 1
npm test               # Terminal 2
```

This sends sample events from `fixtures/sample-events.json` to your local webhook.

### Sending real test verifications

```bash
node send-test-verification.js +15551234567
```

## Event Types

Verify Events sends five message status event types:

| Event Type | Description |
|------------|-------------|
| `message.sent` | Message accepted by carrier |
| `message.delivered` | Message reached the device |
| `message.undelivered` | Delivery failed (invalid number, blocking, etc.) |
| `message.failed` | Message rejected before reaching carrier |
| `message.read` | Message opened (channels with read receipts only) |

**Note:** `read` events are not available for SMS.

## Event Payload Structure

Events follow the [CloudEvents](https://cloudevents.io/) specification:

```json
{
  "specversion": "1.0",
  "type": "com.twilio.accountsecurity.verify.message.delivered",
  "source": "/v2/Services/VA.../Verifications/VE...",
  "id": "unique-event-id",
  "dataschema": "https://events-schemas.twilio.com/AccountSecurity.MessageStatusEvent/1",
  "datacontenttype": "application/json",
  "time": "2026-03-31T14:28:07.000Z",
  "data": {
    "channel": "SMS",
    "verification_sid": "VExxxx",
    "attempt_sid": "VLxxxx",
    "to": "+15551234567",
    "message_status": "DELIVERED",
    "account_sid": "ACxxxx",
    "service_sid": "VAxxxx",
    "mcc": "311",
    "mnc": "180",
    "has_fallback": false,
    "is_fallback": false,
    "created_at": "2026-03-31T14:28:07Z"
  }
}
```

### Key Fields

- `verification_sid` - Links event to Verify verification
- `attempt_sid` - Tracks individual delivery attempts (important for fallback)
- `message_status` - Current delivery state
- `mcc`/`mnc` - Mobile carrier identifiers
- `has_fallback`/`is_fallback` - Fallback configuration status

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Yes |
| `VERIFY_SERVICE_SID` | Verify Service SID | For testing |
| `WEBHOOK_URL` | Public webhook URL | For setup |
| `EVENT_SINK_SID` | Event Streams Sink SID | After setup |
| `EVENT_SUBSCRIPTION_SID` | Event Streams Subscription SID | After setup |
| `PORT` | Server port (default: 3000) | No |

## Project Structure

```
├── index.js                      # Webhook server
├── setup.js                      # Event Streams configuration
├── teardown.js                   # Resource cleanup
├── send-test-verification.js     # Test verification sender
├── test-local.sh                 # Local testing script
├── fixtures/
│   └── sample-events.json        # Sample event payloads
├── .env.example                  # Environment template
├── README.md                     # This file
├── PROJECT.md                    # Detailed file reference
└── TESTING.md                    # Testing strategy
```

## Production Considerations

### 1. Persist Events

This example logs to stdout. For production:
- Store events in a database keyed by `verification_sid` and `attempt_sid`
- Enable querying delivery status via API
- Build dashboards and analytics

### 2. Add Authentication

This example has no authentication to keep the code simple. For production:
- Implement API keys or bearer tokens
- Use IP allowlisting
- Implement Twilio Event Streams signature validation

### 3. Handle Asynchronous Delivery

- Delivery status arrives asynchronously (seconds to minutes after sending)
- Design UIs to show pending states
- Don't treat lack of `delivered` event as immediate failure (carriers may take up to 1 hour)

### 4. Monitor and Alert

- Alert on high failure rates
- Track delivery latency by carrier/country
- Detect carrier-specific issues using `mcc`/`mnc` fields

## Development

### Code Organization

**[index.js](index.js)** - Minimal webhook server (< 100 lines):
- Accepts POST requests at `/events`
- Filters for message status events
- Logs raw event payloads

**[setup.js](setup.js)** - Automated Event Streams setup:
- Creates webhook sink
- Creates subscription for all 5 message status event types

**[teardown.js](teardown.js)** - Cleanup script:
- Deletes subscription
- Deletes sink

### Testing Strategy

See [TESTING.md](TESTING.md) for details.

**Local testing:**
- Use fixture events in `fixtures/sample-events.json`
- Validated against real Twilio events
- No SMS costs or delays

**End-to-end testing:**
- Send real verifications via `send-test-verification.js`
- Verify events arrive at webhook
- Inspect event structure and timing

## Troubleshooting

**No events arriving:**
1. Check Verify Events is enabled on your Verify Service (Console → Verify → Services → General)
2. Verify webhook URL is publicly accessible (test with `curl`)
3. Check Event Streams subscription is active (run `setup.js` again)
4. Ensure ngrok tunnel is still running

**Events arriving but webhook returns errors:**
- Check server logs for error messages
- Verify environment variables are set correctly
- Test locally with `npm test` first

## Resources

- [Verify Events Documentation](https://www.twilio.com/docs/verify/verify-events)
- [Verify Events Onboarding Guide](https://www.twilio.com/docs/verify/verify-events-webhook-onboarding-guide)
- [Message Status Stream Docs](https://www.twilio.com/docs/verify/message-status)
- [Changelog: Message Status Events](https://www.twilio.com/en-us/changelog/verify-events--message-status-event-types-pilot)
- [CloudEvents Specification](https://cloudevents.io/)

## License

ISC

## Contributing

This is an educational example. Feel free to fork and adapt for your use case.
