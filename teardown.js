#!/usr/bin/env node

/**
 * Twilio Verify Events Teardown Script
 *
 * This script removes the Event Stream sink and subscription created by setup.js
 *
 * Usage: node teardown.js
 */

require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SINK_SID = process.env.EVENT_SINK_SID;
const SUBSCRIPTION_SID = process.env.EVENT_SUBSCRIPTION_SID;

async function teardown() {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
        console.error('Error: Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
        process.exit(1);
    }

    if (!SINK_SID && !SUBSCRIPTION_SID) {
        console.error('Error: No EVENT_SINK_SID or EVENT_SUBSCRIPTION_SID found in .env');
        console.error('Nothing to clean up.');
        process.exit(1);
    }

    console.log('Tearing down Twilio Verify Events resources...\n');

    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    try {
        // Delete subscription first
        if (SUBSCRIPTION_SID) {
            console.log(`Deleting subscription ${SUBSCRIPTION_SID}...`);
            await client.events.v1.subscriptions(SUBSCRIPTION_SID).remove();
            console.log('✓ Subscription deleted\n');
        }

        // Delete sink
        if (SINK_SID) {
            console.log(`Deleting sink ${SINK_SID}...`);
            await client.events.v1.sinks(SINK_SID).remove();
            console.log('✓ Sink deleted\n');
        }

        console.log('Teardown complete!');
        console.log('Remember to remove EVENT_SINK_SID and EVENT_SUBSCRIPTION_SID from your .env file');

    } catch (error) {
        console.error('Error during teardown:', error.message);
        if (error.code) {
            console.error(`Error code: ${error.code}`);
        }
        process.exit(1);
    }
}

teardown();
