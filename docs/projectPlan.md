# Project Plan: La-Minks Cleaning Services

## Architecture Review
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod.
- **Backend**: Node.js, Express 5.1.x, MongoDB Atlas (Mongoose 8.16.x), JWT Authentication, Nodemailer.
- **Payments**: Paystack (ZAR currency).
- **File Storage**: MongoDB GridFS for before/after photos.

## Core Entities
1. **User**: Admin, Staff, Customer roles.
2. **Service**: Cleaning services offered.
3. **PricingRule**: Dynamic pricing based on sqm, bedrooms, condition, etc.
4. **Booking**: Customer bookings with state tracking (QUOTE to COMPLETED).
5. **AuditLog**: System tracking for actions.

## Phase Breakdown
- **Phase 1: Project Setup & Infrastructure** (Monorepo, ESLint, DB connect, Models)
- **Phase 2: Authentication & Authorization** (Register, Login, Role Guards)
- **Phase 3: Core Entities API** (Services, Pricing Rules, Users CRUD)
- **Phase 4: Public Website & Quotes** (Home, Service pages, 6-step Quote Wizard)
- **Phase 5: Booking & Payments** (Paystack Integration, Webhooks, Booking state)
- **Phase 6: Staff Portal & File Uploads** (GridFS, Job Checklist, Photo Uploads)
- **Phase 7: Admin Dashboard & Reports** (Overview, Management, Exports)
- **Phase 8: Polish & Seed Scripts** (Email Notifications, Seed Data, Final Testing)
