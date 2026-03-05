# La-Minks Cleaning Services

A full-stack web application for managing cleaning service bookings, built with Next.js, Node.js/Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| State | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (access + refresh tokens, HTTP-only cookies) |
| Payments | Paystack |
| File Storage | GridFS (MongoDB) |
| Email | Nodemailer (SMTP) |

---

## Project Structure

```
la-minks/
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env          # (see Environment Variables below)
│   └── package.json
├── frontend/         # Next.js app
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   ├── lib/
│   │   └── store/    # Zustand stores
│   └── package.json
└── docs/
    └── roadmap.md
```

---

## Prerequisites

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Paystack](https://paystack.com) account (test keys are fine)
- An SMTP account (Gmail with App Password, or [Ethereal](https://ethereal.email) for local testing)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Malopex7/la-minks.git
cd la-minks
```

### 2. Configure the backend environment

Create `backend/.env` (copy from the template below):

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/la-minks-db

# JWT
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<long-random-string>_refresh

# Server
PORT=5001
FRONTEND_URL=http://localhost:3000

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxx

# Nodemailer SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="La-Minks"
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

> **Ethereal (local testing)**: Replace `SMTP_*` values with credentials from [https://ethereal.email/create](https://ethereal.email/create). Emails are captured in Ethereal's web inbox — nothing is sent to real addresses.

### 3. Install dependencies and seed the database

```bash
# Backend
cd backend
npm install

# Seed admin user, services, and pricing rules
node seed_staff.js
```

> The seed script creates an admin account. Check `seed_staff.js` for the default credentials and change them after first login.

### 4. Start the backend

```bash
cd backend
npm run dev
# API running at http://localhost:5001
```

### 5. Install frontend dependencies and start

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## User Roles

| Role | Portal | Access |
|---|---|---|
| `customer` | `/dashboard` | View bookings, pay, view photos |
| `staff` | `/staff` | View assigned jobs, check in, upload photos |
| `admin` | `/admin` | Full access — bookings, services, audit log, CSV export |

---

## Key Features

- **Quote Wizard** — 6-step form with server-side price calculation
- **Paystack Payments** — online card payment with webhook verification
- **Photo Capture** — staff upload before/after photos stored in GridFS; lightbox viewer across all portals
- **Email Notifications** — booking confirmed, staff assigned, staff check-in, job completed
- **Admin Bookings** — status updates, staff assignment, expandable photo gallery
- **CSV Export** — 27-column booking report downloadable from the admin dashboard
- **Audit Log** — paginated log of all system actions with filtering by entity type and action

---

## API Overview

| Prefix | Description |
|---|---|
| `POST /api/auth/register` | Register a new customer account |
| `POST /api/auth/login` | Login and receive JWT tokens |
| `GET /api/bookings/my` | Customer's own bookings |
| `GET /api/bookings` | All bookings (admin) |
| `PUT /api/bookings/:id/status` | Change status (admin) |
| `PUT /api/bookings/:id/assign-staff` | Assign staff (admin) |
| `PUT /api/bookings/:id/staff-update` | Staff check-in / complete |
| `POST /api/bookings/:id/photos/:type` | Upload before/after photo (staff) |
| `GET /api/photos/:fileId` | Serve a photo (public) |
| `POST /api/payments/paystack/initialize` | Initiate Paystack payment |
| `GET /api/payments/paystack/verify/:ref` | Verify payment after redirect |
| `GET /api/audit` | Paginated audit log (admin) |
| `GET /api/services` | Public service list |

---

## Running Lint

```bash
cd frontend
npm run lint
```

Expected: **0 errors** (only `<img>` optimization warnings for GridFS URLs).

---

## Deployment Notes

- Set `FRONTEND_URL` in `backend/.env` to your production domain.
- Configure Paystack webhook URL in the Paystack dashboard to point at `/api/payments/paystack/webhook`.
- Ensure MongoDB Atlas IP allowlist includes your server's IP (or use `0.0.0.0/0` for development).
- For production email, use a transactional provider (SendGrid, Resend, etc.) instead of Gmail SMTP.
