# Development Roadmap

## Phase 1: Project Initialization ✅ (Completed)
- [x] Initialize frontend (Next.js) and backend (Express)
- [x] Setup MongoDB Atlas connection
- [x] Configure Tailwind v4 and shadcn/ui
- [x] Setup environment variables & `.env.example`

## Phase 2: Database & Auth ✅ (Completed)
- [x] Define Mongoose Models (User, Service, PricingRule, Booking, AuditLog)
- [x] Implement JWT Auth routes (Register, Login, Refresh, Logout)
- [x] Implement role-based middleware (Admin, Staff, Customer)

## Phase 3: Core API & Admin Foundation ✅ (Completed)
- [x] Services CRUD API
- [x] Pricing Rules CRUD API
- [x] Admin Dashboard UI (Overview & Service Management)

## Phase 4: Customer Portal & Quotes ✅ (Completed)
- [x] Public Home & Services pages
- [x] Quote Wizard (6 steps including server-side pricing)
- [x] Customer Dashboard (Booking history)

## Phase 5: Booking & Payments ✅ (Completed)
- [x] Create Booking API
- [x] Paystack Integration (`/initialize` and `/verify/:reference`)
- [x] Payment Webhook/Callback handling

## Phase 6: Staff Portal & File Storage ✅ (Completed)
- [x] GridFS Upload API (`/before` & `/after` photos)
- [x] Staff Dashboard (Today's jobs, Check-in, Checklists)
- [x] Mark jobs as completed

## Phase 7: Notifications, Photo Viewing & Reports ✅ (Completed)
- [x] Nodemailer Integration (Booking, Payment, Assignment, Completion emails)
- [x] Job Check-in email notification (staff arrival → customer email)
- [x] Photo serving route made public (GridFS streaming for `<img>` tags)
- [x] Before/After photo lightbox viewer (Admin, Customer & Staff portals)
- [x] Reusable `PhotoLightbox` component + `useLightbox` hook
- [x] Export Reports (CSV) — 27-column admin bookings export
- [x] Admin Bookings: expandable photo gallery row, status dropdown, photo count column
- [x] Admin Dashboard: booking count on overview
- [x] Frontend lint: 0 errors

## Phase 8: Deployment & Seeding ✅ (Completed)
- [x] Develop Seed Script (Admin, Services, Pricing)
- [x] Audit Log Viewer in Admin Dashboard
- [ ] Final README instructions
- [ ] End-to-end testing
