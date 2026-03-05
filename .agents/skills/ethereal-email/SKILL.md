---
name: Ethereal Email Testing
description: Guidelines and configuration for using Ethereal Email for local email testing and development in the La-Minks project.
---

# Ethereal Email Testing Skill

This skill defines how the project handles email testing during local development.

## Core Philosophy
We use **Ethereal Email** (a fake SMTP service provided by Nodemailer) to test email delivery without sending actual emails to real addresses or requiring complex local mail server setups. This prevents accidental spam and simplifies the development workflow.

## Configuration & Usage

1. **Environment Variables:**
   For local development, the `.env` file should have the `SMTP_PASS` variable set to a placeholder (e.g., `your_app_password`) or left empty. 
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=malopex.dev@gmail.com
   SMTP_PASS=your_app_password # Keep as placeholder to trigger Ethereal
   EMAIL_FROM=La-Minks <malopex.dev@gmail.com>
   ```

2. **Automatic Fallback Logic (`utils/email.js`):**
   The email utility is designed to automatically detect if valid SMTP credentials are provided. If `SMTP_PASS` is missing or is the default placeholder, it will automatically generate a temporary Ethereal account on the fly.
   
3. **Viewing Test Emails:**
   When an email is sent in development mode, the backend console will log a preview URL:
   ```
   ✉️  Nodemailer configured in TEST MODE (Ethereal Email).
   🚀 Preview URL: https://ethereal.email/message/...
   ```
   Developers must click this link to view the rendered HTML email in their browser.

## Test Scripts
There is a backend test script available to quickly verify the Ethereal setup without triggering the full application flow:
- `cd backend && node test-email.js` : Tests generic email sending.
- `cd backend && node test-verify.js` : Tests the user registration and email verification flow.

## Production Counterpart
In production, we replace Ethereal with a real SMTP relay provider (such as Resend or Gmail App Passwords) by providing the actual secure `SMTP_PASS` in the production environment variables.
