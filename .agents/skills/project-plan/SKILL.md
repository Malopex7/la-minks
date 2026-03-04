---
name: Project Plan & Architecture
description: The high-level plan, architecture overview, and core entities for the La-Minks development lifecycle.
---

# Project Plan & Architecture: La-Minks Cleaning Services

## Architecture Review
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind v4, shadcn/ui.
- **Backend**: Node.js, Express 5.1.x, MongoDB Atlas, JWT, Nodemailer.
- **Payments**: Paystack integration calculating amounts purely in ZAR.

## Core Entities
1. **User**: Includes Customer, Staff, and Admin roles.
2. **Service**: Specific cleaning services available for booking.
3. **PricingRule**: Calculations based on property size, condition, and extras.
4. **Booking**: Customer bookings tracking state and assignments.
5. **AuditLog**: Detailed tracking of system actions.

## Development Phases
1. **Infrastructure**: Monorepo structure, DB connections, Baseline Models.
2. **Auth & Authorization**: JWT flow, Login/Registration.
3. **Core Entities**: Standard CRUD APIs for Core Services and Pricing.
4. **Public & Quotes**: 6-step Wizard, Marketing sites.
5. **Bookings & Payments**: Transitioning states, Paystack verification.
6. **Staff Portal**: Checklists, GridFS Photo Uploads.
7. **Admin Dashboard**: Revenue generation, Report CSVs.
8. **Polish**: Nodemailer, Seed Scripts, Error Handling.
