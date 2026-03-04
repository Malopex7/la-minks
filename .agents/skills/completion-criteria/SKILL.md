---
name: Completion Criteria
description: Production-readiness requirements and checklists for La-Minks.
---

# Completion Criteria

Before deploying the La-Minks project to production, ensure these items are fully functional and tested.

## 1. Authentication
- Users can register and login securely.
- Passwords are hashed using bcrypt.
- JWT access and refresh tokens are functioning correctly.
- Role-based access control restricts endpoints appropriately for Admin, Staff, and Customer.

## 2. Public Facing & Quotes
- All 12 specific cleaning services are beautifully displayed.
- The 6-step quote wizard correctly calculates pricing completely server-side.

## 3. Booking & Payments
- Bookings transition states accurately (QUOTE -> BOOKED -> CONFIRMED -> IN_PROGRESS -> COMPLETED).
- Paystack initiates payments correctly in ZAR (cents).
- Webhook callbacks successfully verify transactions.

## 4. Staff Portal & Files
- Staff users can easily navigate to and view assigned jobs.
- Upload functionality for before/after photos works securely, stored in MongoDB GridFS.
- Checklists are successfully completed and jobs marked complete.

## 5. Admin Dashboard
- Admins possess full CRUD capabilities over Services, Pricing, and Staff.
- Revenue and statistic dashboards are accurate.
- CSV Reports generate correctly.

## 6. Notifications
- Nodemailer correctly sends emails for various triggered states (booked, assigned, paid, completed).

## 7. Quality & Code
- Zod actively validates inputs across the stack.
- Complete error handling on all API routes.
- Seed data scripts function robustly.
