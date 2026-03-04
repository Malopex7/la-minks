You are a senior full-stack software engineer.

Your task is to build a production-ready web application for a South African cleaning company called:

La-Minks Cleaning Services

The application is a full operational system for managing cleaning bookings, staff assignments, pricing, and payments.

The system must include:

1) Public booking interface
2) Customer dashboard
3) Staff job portal
4) Admin management dashboard
5) Paystack payment integration
6) MongoDB data persistence
7) Email notifications
8) Role-based authentication

All features must be fully implemented with no placeholders.

The final code must run locally and be structured for production deployment.

---

GENERAL DEVELOPMENT RULES

Use npm as the package manager.

The application must prioritize:

- clarity
- readability
- maintainability
- modular architecture

Do not use Docker.

Provide complete error handling and validation.

All inputs must be validated using Zod.

Passwords must be hashed with bcrypt.

Use JWT authentication with access and refresh tokens.

All API requests must include proper authentication and authorization checks.

---

TECH STACK

Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form + Zod

Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT authentication
- Nodemailer for email notifications

File Storage

- MongoDB GridFS

Payments

- Paystack

Currency

- ZAR (South African Rand)

---

PROJECT STRUCTURE

Monorepo layout

/
  frontend/
  backend/
  docs/
  README.md
  .env.example

---

DOCUMENTATION REQUIREMENTS

Inside docs create:

adaptivePreferences.md
completionCriteria.md
errorLog.md
roadmap.md
projectPlan.md

Each document must contain meaningful content.

README must contain:

installation instructions
environment variable configuration
MongoDB Atlas setup
Paystack setup
running frontend/backend locally
seed script instructions

---

AUTHENTICATION

Roles

ADMIN
STAFF
CUSTOMER

Capabilities

Customer

- register
- login
- request quotes
- create bookings
- pay for bookings
- view booking history

Staff

- login
- view assigned jobs
- upload before/after photos
- complete checklists
- mark jobs completed

Admin

- manage services
- manage pricing
- manage staff
- assign bookings
- monitor revenue
- export reports

---

DATABASE MODELS

User

name
email
phone
passwordHash
role
isActive
createdAt
updatedAt

Service

name
description
baseRate
icon
isActive

PricingRule

serviceId
propertySizeBands
conditionMultipliers
extras
updatedAt

Booking

customerId
serviceId

address
  line1
  suburb
  city
  province
  postalCode

property
  sqm
  bedrooms
  bathrooms
  conditionLevel

extrasSelected

schedule
  date
  timeSlot
  estimatedHours

staffAssignedIds

status
  QUOTE
  BOOKED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED

payment

  status
    UNPAID
    PENDING
    PAID
    FAILED

  provider
    PAYSTACK

  reference
  amount
  currency
  paidAt
  channel

checklist

photos
  before
  after

notesCustomer
notesStaff

createdAt
updatedAt

AuditLog

actorUserId
action
entityType
entityId
metadata
createdAt

---

PUBLIC WEBSITE

Home page

- company introduction
- service categories
- call-to-action booking buttons

Services page

Display services:

Home Cleaning
Office Cleaning
Window Cleaning
Carpet Cleaning
Move Out Cleaning
Upholstery Cleaning
Afterparty Cleaning
New House Cleaning
Bedroom Cleaning
Painting
Gardening

Each service includes a booking option.

---

QUOTE SYSTEM

Quote wizard

Step 1
Select service

Step 2
Enter property details

sqm
bedrooms
bathrooms
condition level

Step 3
Select extras

Step 4
Enter address

Step 5
Select schedule

Step 6
Review quote

Pricing must be calculated server-side.

Quote response must include

base cost
extras cost
estimated hours
final price

---

BOOKING FLOW

Booking created with status BOOKED.

Payment status UNPAID.

Customer may pay immediately or later.

---

PAYSTACK PAYMENT INTEGRATION (SOUTH AFRICA)

Currency must be ZAR.

All amounts must be sent to Paystack in cents.

Example

R500 → 50000

Never accept payment amounts from frontend.

Backend must calculate payment amount from booking record.

Environment variables

PAYSTACK_SECRET_KEY
PAYSTACK_CALLBACK_URL
PAYMENT_CURRENCY=ZAR
FRONTEND_URL

---

PAYMENT ENDPOINTS

POST /api/payments/paystack/initialize

Request

bookingId

Backend must

verify booking ownership
verify booking unpaid
calculate amount in cents
initialize Paystack transaction
store reference
set payment status PENDING

Return

authorization_url

Frontend redirects user to Paystack.

---

PAYMENT CALLBACK FLOW

Frontend page

/pay/callback

Steps

read reference from URL

call backend

GET /api/payments/paystack/verify/:reference

Backend verifies Paystack transaction.

If successful

payment.status = PAID
booking.status = CONFIRMED

Store

amount
currency
paidAt
channel

Send confirmation email.

If verification fails

payment.status = FAILED.

---

ADMIN DASHBOARD

Admin overview

bookings this week
revenue
paid vs unpaid
active staff

Management features

Services CRUD
Pricing rules management
Booking management
User management
Reports export CSV
Audit log viewer

---

STAFF PORTAL

Staff dashboard

Shows

today's jobs
upcoming jobs

Job detail

address
customer
checklist

Staff must

check in
upload before photos
complete checklist
upload after photos
mark job complete

---

FILE UPLOADS

Before/after photos must be stored in MongoDB GridFS.

Only image file types allowed.

Implement file size limits.

Uploaded files must require authentication to access.

---

EMAIL NOTIFICATIONS

Use Nodemailer.

Send emails for

booking created
payment confirmed
staff assignment
job completion

SMTP credentials must be environment variables.

---

API ROUTES

Auth

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me

Services

GET /api/services
POST /api/services
PUT /api/services/:id
DELETE /api/services/:id

Pricing

GET /api/pricing/:serviceId
PUT /api/pricing/:serviceId

Bookings

POST /api/quote
POST /api/bookings
GET /api/bookings/my
GET /api/bookings
GET /api/bookings/:id
PUT /api/bookings/:id/status
PUT /api/bookings/:id/assign-staff

Payments

POST /api/payments/paystack/initialize
GET /api/payments/paystack/verify/:reference

Uploads

POST /api/uploads/booking/:id/before
POST /api/uploads/booking/:id/after
GET /api/uploads/:fileId

---

UI REQUIREMENTS

Use shadcn/ui components including

Button
Card
Table
Badge
Dialog
Tabs
Form
Input
Select
Toast

Provide a clean modern UI.

Include loading skeletons.

Include toast error notifications.

---

SEED SCRIPT

Create a seed script to generate

default admin account
example services
example pricing rules

---

FINAL OUTPUT

Generate code in the following order

1 project folder structure
2 backend implementation
3 frontend implementation
4 seed script
5 README
6 docs folder

All commands must use npm.

Project must run with

npm install
npm run dev

for both frontend and backend.