# Project Structure

This is a complete, production-ready example of how to track SMS delivery status using Twilio Verify Events.

## Core Files

### [index.js](index.js)
The webhook server that receives Verify Events from Twilio. 
- Validates webhook signatures
- Filters for message status events
- Logs delivery updates in real-time
- Minimal code to show the core integration pattern

### [setup.js](setup.js)
Automated script to configure Twilio Event Streams.
- Creates a webhook sink pointing to your server
- Creates a subscription for all five message status event types
- Outputs the SIDs to save in your `.env` file

### [teardown.js](teardown.js)
Cleanup script to remove Twilio resources.
- Deletes the subscription
- Deletes the sink
- Run this when you're done testing

### [send-test-verification.js](send-test-verification.js)
Helper script to trigger a test Verify SMS.
- Sends a verification to a phone number
- Shows the verification SID
- Tells you what events to watch for

## Configuration

### [.env.example](.env.example)
Environment template with all required variables:
- Twilio credentials (Account SID, Auth Token)
- Verify Service SID (for sending test verifications)
- Webhook URL (your ngrok or public URL)
- Event Streams resource SIDs (populated after running setup)
- Security settings (signature validation toggle)

Copy this to `.env` and fill in your values.

## Testing

### [test-local.sh](test-local.sh)
Shell script that sends the fixture events to your local server.
- Checks if server is running
- POSTs sample events from `fixtures/sample-events.json` to `/events`
- Shows the response

Quick way to test without sending real SMS.

### [fixtures/sample-events.json](fixtures/sample-events.json)
Three realistic event payloads for local testing:
- `message.sent` - Message accepted by carrier
- `message.delivered` - Message reached the device
- `message.failed` - Message delivery failed

These fixtures were validated against real Twilio events to ensure accurate structure.

### [send-test-verification.js](send-test-verification.js)
Helper script to trigger a test Verify SMS.
- Sends a verification to a phone number
- Shows the verification SID
- Tells you what events to watch for

Use this to test with real events.

## Documentation

### [README.md](README.md)
Complete guide written as a blog post answering:
**"Is there a way to programmatically check the delivery status of an SMS-based Verify verification?"**

Includes:
- 5-minute quick start
- What Verify Events are and why they matter
- Step-by-step setup instructions
- Local testing workflow
- Production considerations
- Code explanations

Designed for developers and AI coding agents to follow.

### [PROJECT.md](PROJECT.md) (this file)
Project structure reference showing what each file does.

### [TESTING.md](TESTING.md)
Explains the testing strategy for this example:
- Why fixtures + manual testing are sufficient
- How to validate fixtures against real events
- When you would add automated tests
- Example test structure (if you wanted to add them)

## Dependencies

### [package.json](package.json)
Node.js project configuration with:
- `express` - Web server
- `twilio` - Twilio SDK for signature validation and API calls
- `dotenv` - Environment variable loading

Scripts:
- `npm start` - Start the webhook server
- `npm run setup` - Create Twilio resources
- `npm run teardown` - Delete Twilio resources
- `npm test` - Send sample events to local server

## Other Files

### [.gitignore](.gitignore)
Prevents committing:
- `.env` (contains secrets)
- `node_modules/`
- Logs
- OS files

## Design Philosophy

This project demonstrates:

1. **Simplicity** - Minimal code focused on the core pattern
2. **Completeness** - Everything needed for a working proof of concept
3. **Education** - Clear explanations of what's happening and why
4. **Production-readiness** - Includes security (signature validation) and automation (setup scripts)
5. **Testability** - Can test locally without triggering real SMS

The code shows exactly what Twilio sends and how to receive it, without abstracting away the details. This makes it ideal for understanding the underlying technology.

## Quick Start Checklist

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in Twilio credentials and Verify Service SID
- [ ] Start ngrok: `ngrok http 3000`
- [ ] Update `WEBHOOK_URL` in `.env` with ngrok URL
- [ ] Run `npm run setup` to create Twilio resources
- [ ] Update `.env` with the returned SIDs
- [ ] Enable Verify Events in Twilio Console for your Verify Service
- [ ] Run `npm start` to start the webhook server
- [ ] Run `node send-test-verification.js +15551234567`
- [ ] Watch the logs for delivery events!

## Next Steps

To turn this into a production integration:

1. **Store events** - Write to a database keyed by `verification_sid`
2. **Add monitoring** - Alert on high failure rates
3. **Build a dashboard** - Show delivery stats by country/carrier
4. **Trigger workflows** - Auto-retry failed verifications on different channels
5. **Track metrics** - Measure delivery latency and success rates

The webhook pattern stays the same. You're just adding persistence and business logic on top.
