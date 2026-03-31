require('dotenv').config();
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

const MESSAGE_STATUS_TYPES = new Set([
    'com.twilio.accountsecurity.verify.message.sent',
    'com.twilio.accountsecurity.verify.message.delivered',
    'com.twilio.accountsecurity.verify.message.read',
    'com.twilio.accountsecurity.verify.message.undelivered',
    'com.twilio.accountsecurity.verify.message.failed',
]);

app.use(express.json());

// Note: For production, implement Twilio Event Streams signature validation
// Event Streams signature validation is complex due to query parameters
// This example focuses on demonstrating the event payload structure

app.post('/events', (req, res) => {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    console.log(`\n[${new Date().toISOString()}] Received ${events.length} event(s)`);

    events.forEach(event => {
        if (!event || !event.type) {
            console.log('WARNING: Skipping malformed event:', event);
            return;
        }

        if (!MESSAGE_STATUS_TYPES.has(event.type)) {
            console.log(`INFO: Ignoring non-message-status event: ${event.type}`);
            return;
        }

        // Log the full event payload as received from Twilio
        console.log('\nVerify message status event:');
        console.log(JSON.stringify(event, null, 2));

        // Highlight key fields for easier scanning
        const data = event.data || {};
        console.log('\nKey details:');
        console.log(`  Status: ${data.message_status}`);
        console.log(`  Verification SID: ${data.verification_sid}`);
        console.log(`  Channel: ${data.channel}`);
        console.log(`  To: ${data.to}`);
        console.log(`  Event time: ${event.time}`);
        console.log('---\n');
    });

    res.sendStatus(200);
});

app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Verify Events sink is running' });
});

app.listen(PORT, () => {
    console.log('\nVerify Events webhook server running');
    console.log(`  Port: ${PORT}`);
    console.log(`  Endpoint: POST /events`);
    console.log('\nWaiting for Verify message status events...\n');
});
