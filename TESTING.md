# Testing Strategy

This document explains the testing approach for this Verify Events example.

## Current Testing Approach

### 1. **Fixture-Based Local Testing** ✅
The `fixtures/sample-events.json` file contains realistic event payloads that you can test with locally:

```bash
# Start server without signature validation
VALIDATE_SIGNATURES=false npm start

# In another terminal
./test-local.sh
```

**What this validates:**
- Event filtering logic (message status vs other events)
- Event processing and logging
- Array vs single event handling
- Malformed event handling

**Advantages:**
- Fast - no external API calls needed
- Repeatable - same results every time
- No cost - doesn't send real SMS
- Debuggable - easy to modify fixtures and test edge cases

### 2. **Manual End-to-End Testing** ✅
Use the provided scripts to test with real Twilio services:

```bash
# 1. Set up Event Streams
npm run setup

# 2. Enable Verify Events in Console
# (Go to Verify > Services > General > Enable "Verify Events subscribed service")

# 3. Send a real verification
node send-test-verification.js +15551234567

# 4. Watch webhook logs for events
```

**What this validates:**
- Full Event Streams integration
- Webhook signature validation
- Real event payload structure
- Event delivery timing and reliability

## Fixture Validation

### How to Verify Fixtures Match Real Events

Once you get real events flowing (after enabling Verify Events in Console), compare them:

1. **Capture a real event** from your webhook logs
2. **Compare to fixture structure**:
   - Same top-level fields? (`type`, `id`, `account_sid`, `time`, `data`)
   - Same `data` fields? (`verification_sid`, `attempt_sid`, `channel`, `to`, `message_status`, etc.)
   - Same data types? (strings, booleans, timestamps)

3. **Update fixtures if needed** to match any differences

### Known Fixture Characteristics

The `sample-events.json` fixtures were created based on:
- Twilio's Event Streams documentation
- Verify Events schema
- Expected message status event structure

They use:
- Placeholder SIDs (VExxxx, VLAxxx, ACxxxx)
- Fake phone numbers (+15551234567)
- Realistic timestamps and statuses
- Common carrier codes (MCC/MNC)

## Should You Add Automated Tests?

### ❌ Probably Not (For This Project)

**Reasons to skip automated tests:**
1. **Educational focus** - This is a blog post example showing how the technology works
2. **Simplicity matters** - Adding Jest/Mocha increases complexity and dependencies
3. **Fixtures are sufficient** - They demonstrate correctness without test infrastructure
4. **Manual testing works** - The scripts make E2E testing easy
5. **Low risk** - This isn't production code serving traffic

**The goal:** Help developers understand Verify Events quickly, not teach testing best practices.

### ✅ When You *Would* Add Tests

If you were building a **production Verify Events integration**, tests would be valuable:

#### Example Test Structure

Here's what a test suite might look like (using Jest or Mocha):

```javascript
// Example test structure - would need a test framework like Jest or Mocha
const request = require('supertest');
const express = require('express');

describe('Verify Events Webhook', () => {

  // Test 1: Webhook processes valid message status events
  test('processes sent event correctly', async () => {
    const event = {
      type: 'com.twilio.accountsecurity.verify.message.sent',
      data: { message_status: 'SENT' }
    };
    // Assert event is logged and returns 200
  });

  // Test 2: Webhook ignores non-message-status events
  test('ignores non-message-status events', async () => {
    const event = {
      type: 'com.twilio.accountsecurity.verify.check.created'
    };
    // Assert event is skipped but returns 200
  });

  // Test 3: Webhook handles malformed events
  test('handles malformed events gracefully', async () => {
    const event = { invalid: 'data' };
    // Assert event is skipped but returns 200
  });

  // Test 4: Webhook handles batched events
  test('processes multiple events in one payload', async () => {
    const events = [/* array of events */];
    // Assert all events are processed
  });
});
```

**Why these tests matter:**
- Validates event filtering logic
- Ensures error handling doesn't crash the server
- Documents expected behavior

**Why they're overkill for this project:**
- This is an educational example, not production code
- The fixtures + manual testing demonstrate correctness
- Adding test infrastructure (Jest, mocks) increases complexity
- The blog post focuses on showing the technology, not testing practices

## Testing Checklist for Production

If you're using this as a template for a real integration, test:

- [ ] Webhook receives and processes all event types
- [ ] Signature validation rejects invalid requests
- [ ] Events are persisted correctly
- [ ] Database writes don't block webhook responses (async)
- [ ] Failed database writes trigger alerts
- [ ] Delivery status updates your application state
- [ ] High failure rates trigger operational alerts
- [ ] Webhook handles Twilio's exponential backoff retries
- [ ] Missing events (gaps in attempt_sid sequence) are detected
- [ ] Old events (delivered >1hr late) are handled gracefully

## Current Test Coverage

✅ **Covered by fixtures + scripts:**
- Event parsing and filtering
- Webhook endpoint functionality
- Setup/teardown scripts
- Signature validation (with ngrok)
- Real verification sending

❌ **Not covered:**
- Edge cases (malformed JSON, invalid signatures, etc.)
- Performance/load testing
- Database persistence (not implemented)
- Error handling for downstream failures

## Recommendations

**For this blog post example:**
- Keep the current fixture + manual testing approach
- Update fixtures if you find differences vs real events
- Add a note in README about fixture validation

**If extending for production:**
- Add automated tests for event processing logic
- Add integration tests for database persistence
- Add monitoring/alerting (not just tests)
- Consider using Twilio's webhook retry logic for reliability

## How to Validate Fixtures (Quick Guide)

1. **Enable Verify Events** in Console on your Verify Service
2. **Start your webhook** with `npm start` (with ngrok running)
3. **Send a test verification** to your phone
4. **Copy a real event** from your webhook logs
5. **Compare to fixture** in `fixtures/sample-events.json`
6. **Update fixture** if structure differs
7. **Document differences** (if any) in fixture comments

The most important fields to validate:
- `data.verification_sid` format and length
- `data.attempt_sid` format (VLA prefix)
- `data.message_status` enum values
- `data.channel` enum values
- `data.mcc` and `data.mnc` presence and format
- Timestamp formats for `time` and `data.created_at`
