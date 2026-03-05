import { sendEmail } from './src/utils/email.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Nodemailer Configuration...');
console.log(`Host: ${process.env.SMTP_HOST}`);
console.log(`Port: ${process.env.SMTP_PORT}`);
console.log(`User: ${process.env.SMTP_USER}`);
console.log(`From: ${process.env.EMAIL_FROM}`);

const testEmail = async () => {
    try {
        const testHtml = `
            <h2>La-Minks SMTP Test Successful! 🎉</h2>
            <p>If you are reading this email, your Nodemailer integration is configured correctly.</p>
            <p>Booking, payment, and staff assignment emails will now be sent automatically.</p>
            <br/>
            <small>Sent at: ${new Date().toLocaleString()}</small>
        `;

        console.log(`\nAttempting to send test email to: ${process.env.SMTP_USER}...`);

        await sendEmail(
            process.env.SMTP_USER, // Send it to yourself as a test
            'Test: La-Minks Email Configuration',
            testHtml
        );

        console.log('\n✅ Success! Check your inbox.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to send email. Please check your credentials:');
        console.error(error.message);
        if (error.responseCode === 535) {
            console.error('\n💡 Hint: 535 Auth error usually means you need to generate a Google "App Password" (not your regular password) if using Gmail.');
        }
        process.exit(1);
    }
};

testEmail();
