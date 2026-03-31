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
git clone git@github.com:robinske/verify-events-setup.git
cd verify-events-setup
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

If you provided `VERIFY_SERVICE_SID` in your `.env`, the setup script automatically enabled Verify Events.

Otherwise, enable manually in [Twilio Console](https://console.twilio.com) → Verify → Services → Your Service → General:
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

> **Note:** This example doesn't include automated tests to keep it simple and focused on the integration pattern. The fixtures and manual testing scripts demonstrate correctness without added complexity. For production use, consider adding automated tests for event processing logic, database persistence, and error handling.

## Event Types

Verify Events sends five message status event types:

| Event Type | Description |
|------------|-------------|
| `message.sent` | Message accepted by carrier |
| `message.delivered` | Message reached the device |
| `message.undelivered` | Delivery failed (invalid number, blocking, etc.) |
| `message.failed` | Message rejected before reaching carrier |
| `message.read` | Message opened (channels with read receipts only) |

**Notes:**
- `read` events are not available for SMS
- This example focuses on **message delivery status** (whether the SMS was sent/delivered). Verify Events also supports **verification lifecycle events** (`pending`, `approved`, `canceled`, `max_attempts_reached`) that track the verification attempt status. These are available through the same Event Streams subscription but are not explicitly covered in this example. See the [Verify Events documentation](https://www.twilio.com/docs/verify/verify-events) for the complete list of event types.

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

### Exploring Event Schemas

Each event type has a published JSON schema that defines all fields and data types. You can fetch schemas directly:

```bash
# Message status event schema (sent, delivered, failed, etc.)
curl -X GET https://events-schemas.twilio.com/AccountSecurity.MessageStatusEvent/1

# General Verify event schema
curl -X GET https://events-schemas.twilio.com/AccountSecurity.VerifyEventStreamEvent/1
```

The `dataschema` field in each event points to its schema URL. Use these schemas to:
- Validate event structure in tests
- Generate TypeScript/JSON Schema types
- Understand all available fields and their formats

See the [Verify Events Onboarding Guide - Step 3](https://www.twilio.com/docs/verify/verify-events-webhook-onboarding-guide#step-3-explore-verify-event-schemas) for more details on working with schemas.

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
├── index.js                      # Webhook server (~70 lines)
├── setup.js                      # Event Streams + Verify Events setup
├── teardown.js                   # Resource cleanup
├── send-test-verification.js     # Send test SMS to trigger events
├── test-local.sh                 # Local testing script (uses fixtures)
├── fixtures/
│   └── sample-events.json        # Sample event payloads for testing
├── .env.example                  # Environment variable template
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Dependencies

- **express** - Web server for webhook endpoint
- **twilio** - Twilio SDK for API calls and Event Streams setup
- **dotenv** - Environment variable loading

### Available Scripts

- `npm start` - Start the webhook server on port 3000
- `npm run setup` - Create Event Streams resources and enable Verify Events
- `npm run teardown` - Delete Event Streams resources
- `npm test` - Send fixture events to local server for testing

## Production Considerations

### 1. Persist Events

This example logs to stdout. For production:
- Store events in a database keyed by `verification_sid` and `attempt_sid`
- Enable querying delivery status via API
- Build dashboards and analytics

### 2. Add Authentication

This example has no authentication to keep the code simple. For production:
- Implement Twilio Event Streams signature validation
- Use API keys or bearer tokens for additional security
- Consider IP allowlisting

### 3. Handle Asynchronous Delivery

- Delivery status arrives asynchronously (seconds to minutes after sending)
- Design UIs to show pending states
- Don't treat lack of `delivered` event as immediate failure (carriers may take up to 1 hour)

### 4. Monitor and Alert

- Alert on high failure rates
- Track delivery latency by carrier/country
- Detect carrier-specific issues using `mcc`/`mnc` fields

## Development

### Design Philosophy

This project demonstrates:

1. **Simplicity** - Minimal code focused on the core integration pattern
2. **Completeness** - Everything needed for a working proof of concept
3. **Education** - Clear explanations of what's happening and why
4. **Testability** - Can test locally without triggering real SMS

The code shows exactly what Twilio sends and how to receive it, without abstracting away the details. This makes it ideal for understanding the underlying technology.

### Code Organization

**[index.js](index.js)** - Webhook server (~70 lines):
- Accepts POST requests at `/events`
- Filters for message status events (ignores other event types)
- Handles both single events and batched arrays
- Logs full event payloads with key details highlighted
- Returns 200 status to acknowledge receipt

**[setup.js](setup.js)** - Automated Event Streams and Verify Events setup:
- Creates webhook sink pointing to your server
- Creates subscription for all 5 message status event types
- Automatically enables Verify Events on your service (if VERIFY_SERVICE_SID provided)
- Outputs resource SIDs to add to your `.env`

**[teardown.js](teardown.js)** - Cleanup script:
- Deletes Event Streams subscription
- Deletes Event Streams sink
- Run this when you're done testing to avoid orphaned resources

**[send-test-verification.js](send-test-verification.js)** - Test verification sender:
- Sends a verification SMS to a phone number
- Shows the verification SID to track
- Useful for end-to-end testing with real events

### Testing Strategy

**Local testing:**
- Use fixture events in `fixtures/sample-events.json`
- Validated against real Twilio events
- No SMS costs or delays

**End-to-end testing:**
- Send real verifications via `send-test-verification.js`
- Verify events arrive at webhook
- Inspect event structure and timing

This example doesn't include automated tests to keep it simple and focused on the integration pattern.

## ⚠️ Common Setup Issues

### Event Streams ≠ Verify Events Enabled
Running `npm run setup` configures Event Streams (sink + subscription), but events won't flow until you **also** enable "Verify Events subscribed service" on your Verify Service. The setup script does this automatically if you provide `VERIFY_SERVICE_SID` in `.env` - otherwise you must enable it manually in the Console. **Both Event Streams resources AND the service toggle are required.**

### Ngrok URLs Change on Restart
Free ngrok URLs are temporary. When ngrok restarts with a new URL:
1. Update `WEBHOOK_URL` in `.env` with the new URL
2. Re-run `npm run setup` to recreate the sink with the new destination
   
**Better option:** Use a paid ngrok static domain to avoid this entirely.

### Setup Order Matters
Follow this exact sequence:
1. ✅ Start ngrok first → copy HTTPS URL
2. ✅ Add URL to `.env` as `WEBHOOK_URL`
3. ✅ Add `VERIFY_SERVICE_SID` to `.env` (to auto-enable events)
4. ✅ Run `npm run setup` (creates resources pointing to that URL)
5. ✅ Start webhook server (`npm start`)
6. ✅ Send test verification

**Don't:** Run setup before setting `WEBHOOK_URL` (it will use the wrong URL and fail).

### Webhook Must Be Publicly Accessible
Your webhook **must be**:
- ✅ Publicly accessible over the internet (not `localhost`)
- ✅ HTTPS (not HTTP) - Twilio requires secure webhooks
- ✅ Responding with 200 status codes

Twilio cannot reach `http://localhost:3000` directly - use ngrok or deploy to a hosting provider.

## Troubleshooting

**No events arriving:**
1. Check Verify Events is enabled on your Verify Service (Console → Verify → Services → General)
2. Verify webhook URL is publicly accessible (test with `curl https://your-url.ngrok.io/events`)
3. Check Event Streams subscription is active (run `npm run setup` again)
4. Ensure ngrok tunnel is still running
5. Check ngrok web interface (http://localhost:4040) for incoming requests

**Events arriving but webhook returns errors:**
- Check server logs for error messages
- Verify environment variables are set correctly
- Ensure server is running on the correct port

**"Webhook URL not found" during setup:**
- Make sure ngrok is running and `WEBHOOK_URL` in `.env` is the current ngrok HTTPS URL

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
