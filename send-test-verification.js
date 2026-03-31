#!/usr/bin/env node

/**
 * Send Test Verification
 *
 * Triggers a test Verify SMS to see message status events in action.
 * You can use a real phone number or a Twilio test number.
 *
 * Usage: node send-test-verification.js +15551234567
 */

require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.VERIFY_SERVICE_SID;

async function sendTestVerification() {
    const phoneNumber = process.argv[2];

    if (!phoneNumber) {
        console.error('Error: Phone number required');
        console.log('\nUsage: node send-test-verification.js +15551234567');
        process.exit(1);
    }

    if (!ACCOUNT_SID || !AUTH_TOKEN || !VERIFY_SERVICE_SID) {
        console.error('Error: Missing required environment variables');
        console.error('Please ensure these are set in your .env file:');
        console.error('  - TWILIO_ACCOUNT_SID');
        console.error('  - TWILIO_AUTH_TOKEN');
        console.error('  - VERIFY_SERVICE_SID');
        process.exit(1);
    }

    console.log(`Sending test verification to ${phoneNumber}...\n`);

    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    try {
        const verification = await client.verify.v2
            .services(VERIFY_SERVICE_SID)
            .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });

        console.log('✓ Verification created successfully');
        console.log(`  Verification SID: ${verification.sid}`);
        console.log(`  Status: ${verification.status}`);
        console.log(`  To: ${verification.to}`);
        console.log(`  Channel: ${verification.channel}`);
        console.log(`  Valid: ${verification.valid}`);
        console.log(`\nNow watch your webhook server logs for message status events!`);
        console.log('You should see events like:');
        console.log('  - com.twilio.accountsecurity.verify.message.sent');
        console.log('  - com.twilio.accountsecurity.verify.message.delivered');

    } catch (error) {
        console.error('\nError sending verification:', error.message);
        if (error.code) {
            console.error(`Error code: ${error.code}`);
        }
        if (error.moreInfo) {
            console.error(`More info: ${error.moreInfo}`);
        }
        process.exit(1);
    }
}

sendTestVerification();
