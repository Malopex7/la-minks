# Development Roadmap

## Phase 1: Project Initialization 🚧 (In Progress)
- [x] Initialize frontend (Next.js) and backend (Express)
- [x] Setup MongoDB Atlas connection
- [x] Configure Tailwind v4 and shadcn/ui
- [x] Setup environment variables & `.env.example`

## Phase 2: Database & Auth 🚧 (In Progress)
- [x] Define Mongoose Models (User, Service, PricingRule, Booking, AuditLog)
- [x] Implement JWT Auth routes (Register, Login, Refresh, Logout)
- [ ] Implement role-based middleware (Admin, Staff, Customer)

## Phase 3: Core API & Admin Foundation ⏳ (Pending)
- [ ] Services CRUD API
- [ ] Pricing Rules CRUD API
- [ ] Admin Dashboard UI (Overview & Service Management)

## Phase 4: Customer Portal & Quotes ⏳ (Pending)
- [ ] Public Home & Services pages
- [ ] Quote Wizard (6 steps including server-side pricing)
- [ ] Customer Dashboard (Booking history)

## Phase 5: Booking & Payments ⏳ (Pending)
- [ ] Create Booking API
- [ ] Paystack Integration (`/initialize` and `/verify/:reference`)
- [ ] Payment Webhook/Callback handling

## Phase 6: Staff Portal & File Storage ⏳ (Pending)
- [ ] GridFS Upload API (`/before` & `/after` photos)
- [ ] Staff Dashboard (Today's jobs, Check-in, Checklists)
- [ ] Mark jobs as completed

## Phase 7: Notifications & Polish ⏳ (Pending)
- [ ] Nodemailer Integration (Booking, Payment, Assignment, Completion emails)
- [ ] Export Reports (CSV)
- [ ] Audit Log Viewer in Admin Dashboard

## Phase 8: Deployment & Seeding ⏳ (Pending)
- [ ] Develop Seed Script (Admin, Services, Pricing)
- [ ] Final README instructions
- [ ] End-to-end testing
