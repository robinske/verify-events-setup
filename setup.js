#!/usr/bin/env node

/**
 * Twilio Verify Events Setup Script
 *
 * This script creates an Event Stream sink and subscription for Verify message status events.
 * Run this once to configure your Twilio account to send events to your webhook.
 *
 * Usage: node setup.js
 */

require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const VERIFY_SERVICE_SID = process.env.VERIFY_SERVICE_SID;

// Verify message status event types
const MESSAGE_STATUS_TYPES = [
    'com.twilio.accountsecurity.verify.message.sent',
    'com.twilio.accountsecurity.verify.message.delivered',
    'com.twilio.accountsecurity.verify.message.read',
    'com.twilio.accountsecurity.verify.message.undelivered',
    'com.twilio.accountsecurity.verify.message.failed',
];

async function setup() {
    if (!ACCOUNT_SID || !AUTH_TOKEN || !WEBHOOK_URL) {
        console.error('Error: Missing required environment variables');
        console.error('Please copy .env.example to .env and fill in your credentials');
        process.exit(1);
    }

    console.log('Setting up Twilio Verify Events...\n');

    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    try {
        // Create Event Stream Sink
        console.log('Creating Event Stream sink...');
        const sink = await client.events.v1.sinks.create({
            description: 'Verify Events Webhook Sink',
            sinkConfiguration: {
                destination: WEBHOOK_URL,
                method: 'POST',
                batchEvents: false,
            },
            sinkType: 'webhook',
        });

        console.log(`✓ Sink created: ${sink.sid}`);
        console.log(`  Description: ${sink.description}`);
        console.log(`  Destination: ${WEBHOOK_URL}\n`);

        // Create Subscription for Verify message status events
        console.log('Creating Event Stream subscription...');
        const subscription = await client.events.v1.subscriptions.create({
            description: 'Verify Message Status Events',
            sinkSid: sink.sid,
            types: MESSAGE_STATUS_TYPES.map(type => ({ type })),
        });

        console.log(`✓ Subscription created: ${subscription.sid}`);
        console.log(`  Description: ${subscription.description}`);
        console.log(`  Subscribed to ${MESSAGE_STATUS_TYPES.length} event types\n`);

        // Enable Verify Events on the service if VERIFY_SERVICE_SID is provided
        if (VERIFY_SERVICE_SID) {
            console.log('Enabling Verify Events on service...');
            await client.verify.v2
                .services(VERIFY_SERVICE_SID)
                .update({ verifyEventSubscriptionEnabled: true });
            console.log(`✓ Verify Events enabled on service ${VERIFY_SERVICE_SID}\n`);
        } else {
            console.log('⚠️  VERIFY_SERVICE_SID not provided - you must enable Verify Events manually:');
            console.log('   1. Go to https://console.twilio.com/verify/services');
            console.log('   2. Select your service → General');
            console.log('   3. Toggle on "Verify Events subscribed service"\n');
        }

        console.log('Setup complete! Add these to your .env file:');
        console.log(`EVENT_SINK_SID=${sink.sid}`);
        console.log(`EVENT_SUBSCRIPTION_SID=${subscription.sid}`);
        console.log('\nYour webhook will now receive Verify message status events.');

    } catch (error) {
        console.error('Error during setup:', error.message);
        if (error.code) {
            console.error(`Error code: ${error.code}`);
        }
        process.exit(1);
    }
}

setup();
