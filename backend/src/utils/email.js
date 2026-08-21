import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter;

// Initialize the transporter asynchronously
const initTransporter = async () => {
    // If user provided a real SMTP_PASS, use it
    if (process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_app_password') {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('✉️  Nodemailer configured with custom SMTP credentials.');
    } else {
        // Otherwise, automatically generate a free Ethereal test account!
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        console.log('✉️  Nodemailer configured in TEST MODE (Ethereal Email).');
        console.log(`    Test User: ${testAccount.user}`);
    }
};

// Start the init process immediately
initTransporter().catch(console.error);

// Helper for sending generic emails
export const sendEmail = async (to, subject, html) => {
    try {
        if (!transporter) await initTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"La-Minks" <noreply@laminks.com>',
            to,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent: ${info.messageId} to ${to}`);

        // If we used Ethereal, log the preview URL specifically!
        if (info.messageId && nodemailer.getTestMessageUrl(info)) {
            console.log(`🚀 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return info;
    } catch (error) {
        console.error('Email Sending Error:', error);
        throw error;
    }
};

// Generic Base HTML Template wrapper
const wrapHtmlEmail = (content, title) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { background-color: #f97316; padding: 32px 24px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.025em; }
            .content { padding: 32px 24px; color: #3f3f46; line-height: 1.6; }
            .content p { margin: 0 0 16px 0; }
            .footer { background-color: #fafafa; padding: 24px; text-align: center; color: #a1a1aa; font-size: 14px; border-top: 1px solid #e4e4e7; }
            .button { display: inline-block; padding: 12px 24px; background-color: #f97316; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 16px; }
            .details-box { background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 24px 0; }
            .details-box p { margin: 0 0 8px 0; font-size: 14px; }
            .details-box p:last-child { margin: 0; }
            .details-box strong { color: #18181b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} La-Minks Premium Home Cleaning. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

// Helper to safely parse Mongoose Map serviceDetails
const parseServiceDetails = (details) => {
    if (!details) return {};
    if (typeof details.toJSON === 'function') return details.toJSON();
    if (details instanceof Map) return Object.fromEntries(details.entries());
    return details;
};

// 1. Booking Received (Customer)
export const sendBookingCreatedEmail = async (booking, customerEmail, customerName) => {
    const subject = `Booking Request Received - Ref: ${booking._id.toString().slice(-6).toUpperCase()}`;
    const date = new Date(booking.schedule.date).toLocaleDateString('en-ZA');

    const content = `
        <p>Hi ${customerName},</p>
        <p>Thank you for choosing La-Minks! We have received your booking request for our cleaning services.</p>
        
        <div class="details-box">
            <p><strong>Service:</strong> ${booking.serviceId?.name || 'Cleaning Service'}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${booking.schedule.timeSlot}</p>
            <p><strong>Address:</strong> ${booking.address.line1}, ${booking.address.suburb}</p>
            
            ${Object.keys(parseServiceDetails(booking.serviceDetails)).length > 0 ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Service Details:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${Object.entries(parseServiceDetails(booking.serviceDetails)).map(([k, v]) => `<li>${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${v}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${(booking.extrasSelected?.length > 0) ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Requested Extras:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${booking.extrasSelected.map(e => {
        const isAiExtra = booking.aiExtras?.some(ai => ai.name === e);
        return `<li>${isAiExtra ? '✨ ' : ''}${e}</li>`;
    }).join('')}
                    </ul>
                </div>
            ` : ''}

            <p style="margin-top: 16px;"><strong>Amount Due:</strong> R${(booking.payment?.amount || 0).toFixed(2)}</p>
        </div>

        <p>You can view and manage your booking, or complete your payment via your dashboard.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
        </div>
    `;

    return sendEmail(customerEmail, subject, wrapHtmlEmail(content, 'Booking Received'));
};

// 1b. Quote Generated (Customer)
export const sendQuoteEmail = async (quoteData, customerEmail, customerName = 'Valued Customer') => {
    const refCode = quoteData._id ? quoteData._id.toString().slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const subject = `Your La-Minks Cleaning Quote - Ref: ${refCode}`;
    const dateStr = quoteData.schedule?.date ? new Date(quoteData.schedule.date).toLocaleDateString('en-ZA') : 'Flexible / TBD';
    const amount = Number(quoteData.totalPrice || quoteData.payment?.amount || quoteData.finalPrice || 0);

    const content = `
        <p>Hi ${customerName},</p>
        <p>Thank you for requesting a cleaning quote from La-Minks! Here is your custom estimated quote breakdown:</p>
        
        <div class="details-box">
            <p><strong>Quote Reference:</strong> ${refCode}</p>
            <p><strong>Service:</strong> ${quoteData.serviceName || quoteData.serviceId?.name || 'Cleaning Service'}</p>
            <p><strong>Proposed Date:</strong> ${dateStr}</p>
            ${quoteData.schedule?.timeSlot ? `<p><strong>Preferred Slot:</strong> ${quoteData.schedule.timeSlot}</p>` : ''}
            ${quoteData.address?.line1 ? `<p><strong>Location:</strong> ${quoteData.address.line1}, ${quoteData.address.suburb || quoteData.address.city || ''}</p>` : ''}
            
            ${Object.keys(parseServiceDetails(quoteData.serviceDetails)).length > 0 ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Property / Service Details:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${Object.entries(parseServiceDetails(quoteData.serviceDetails)).map(([k, v]) => `<li>${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${v}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${(quoteData.extrasSelected?.length > 0) ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Selected Extras:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${quoteData.extrasSelected.map(e => {
        const isAiExtra = quoteData.aiExtras?.some(ai => ai.name === e);
        return `<li>${isAiExtra ? '✨ ' : ''}${e}</li>`;
    }).join('')}
                    </ul>
                </div>
            ` : ''}

            ${quoteData.estimatedHours ? `<p style="margin-top: 8px;"><strong>Estimated Time:</strong> ~${quoteData.estimatedHours} hours</p>` : ''}
            <p style="margin-top: 16px; font-size: 18px; color: #d46b4e;"><strong>Estimated Total:</strong> R${amount.toFixed(2)}</p>
        </div>

        <p>No immediate payment is required to review this quote. When you're ready to proceed with your booking, simply log in to your account or click the link below.</p>
        <div style="text-align: center;">
            <a href="${quoteData._id ? `${process.env.FRONTEND_URL}/dashboard/bookings/${quoteData._id}` : `${process.env.FRONTEND_URL}/quote`}" class="button">View & Confirm Booking</a>
        </div>
    `;

    return sendEmail(customerEmail, subject, wrapHtmlEmail(content, 'Your Custom Quote'));
};

// 2. Payment Success (Customer)
export const sendPaymentSuccessEmail = async (booking, customerEmail, customerName) => {
    const subject = `Payment Successful - Ref: ${booking._id.toString().slice(-6).toUpperCase()}`;

    const content = `
        <p>Hi ${customerName},</p>
        <p>Great news! We have successfully received your payment of <strong>R${booking.payment.amount.toFixed(2)}</strong>.</p>
        <p>Your booking is now fully confirmed. Our staff will arrive on the scheduled date to make your home shine.</p>
        
        <div class="details-box">
            <p><strong>Transaction Ref:</strong> ${booking.payment.reference}</p>
            <p><strong>Paid Via:</strong> ${booking.payment.provider}</p>
        </div>

        <p>Thank you for trusting La-Minks!</p>
    `;

    return sendEmail(customerEmail, subject, wrapHtmlEmail(content, 'Payment Confirmed!'));
};

// 3. Staff Assignment Alert (Internal)
export const sendStaffAssignmentEmail = async (booking, staffEmail, staffName) => {
    const subject = `New Job Assigned: ${new Date(booking.schedule.date).toLocaleDateString('en-ZA')}`;
    const date = new Date(booking.schedule.date).toLocaleDateString('en-ZA');

    const content = `
        <p>Hi ${staffName},</p>
        <p>You have been assigned to a new cleaning job.</p>
        
        <div class="details-box">
            <p><strong>Job Ref:</strong> ${booking._id}</p>
            <p><strong>Service:</strong> ${booking.serviceId?.name || 'Cleaning Service'}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${booking.schedule.timeSlot}</p>
            <p><strong>Address:</strong> ${booking.address.line1}, ${booking.address.suburb}</p>

            ${Object.keys(parseServiceDetails(booking.serviceDetails)).length > 0 ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Service Details:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${Object.entries(parseServiceDetails(booking.serviceDetails)).map(([k, v]) => `<li>${k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${v}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${(booking.extrasSelected?.length > 0) ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e4e4e7;">
                    <p style="margin-bottom: 4px;"><strong>Requested Extras:</strong></p>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        ${booking.extrasSelected.map(e => {
        const isAiExtra = booking.aiExtras?.some(ai => ai.name === e);
        return `<li>${isAiExtra ? '✨ ' : ''}${e}</li>`;
    }).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>

        <p>Please log into your staff portal to review the job specifications and checklists.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/staff/bookings/${booking._id}" class="button">View Job Details</a>
        </div>
    `;

    return sendEmail(staffEmail, subject, wrapHtmlEmail(content, 'New Job Assignment'));
};

// 4. Job Check-In (Staff has arrived - Customer notification)
export const sendJobCheckInEmail = async (booking, customerEmail, customerName) => {
    const subject = `Your Cleaner Has Arrived - Ref: ${booking._id.toString().slice(-6).toUpperCase()}`;
    const date = new Date(booking.schedule?.date).toLocaleDateString('en-ZA');

    const content = `
        <p>Hi ${customerName},</p>
        <p>Great news! Your La-Minks cleaning team has just checked in and is getting started on your home.</p>

        <div class="details-box">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${booking.schedule?.timeSlot || 'N/A'}</p>
            <p><strong>Address:</strong> ${booking.address?.line1}, ${booking.address?.suburb}</p>
            <p><strong>Job Ref:</strong> ${booking._id.toString().slice(-6).toUpperCase()}</p>
        </div>

        <p>Sit back and relax — we'll notify you again once the job is complete.</p>
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Booking</a>
        </div>
    `;

    return sendEmail(customerEmail, subject, wrapHtmlEmail(content, 'Your Cleaner Has Arrived! 🧹'));
};

// 5. Job Completed (Customer & Admin)
export const sendJobCompletionEmail = async (booking, customerEmail, customerName) => {
    const subject = `Cleaning Completed - Ref: ${booking._id.toString().slice(-6).toUpperCase()}`;

    const content = `
        <p>Hi ${customerName},</p>
        <p>Your La-Minks cleaning session has been officially marked as completed by our staff!</p>
        <p>We hope you are thrilled with the results. If you have a moment, please log into your dashboard to view the session notes and photos, or to book your next cleaning.</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
        </div>

        <p>Thank you for your business!</p>
    `;

    return sendEmail(customerEmail, subject, wrapHtmlEmail(content, 'Job Completed!'));
};

// 5. Registration Email Verification (Customer)
export const sendVerificationEmail = async (userEmail, userName, token) => {
    const subject = `Welcome to La-Minks! Please Verify Your Email`;

    // The link the user needs to click (points to frontend)
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const content = `
        <p>Hi ${userName},</p>
        <p>Welcome to La-Minks! We're excited to help you keep your home shining.</p>
        <p>Before you can book a cleaning or log into your dashboard, we just need to verify that this is your correct email address.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" class="button" style="background-color: #f97316; padding: 14px 28px; font-size: 16px;">Verify My Email</a>
        </div>

        <p>If you did not create an account with La-Minks, please ignore this email.</p>
    `;

    return sendEmail(userEmail, subject, wrapHtmlEmail(content, 'Verify Your Email'));
};
