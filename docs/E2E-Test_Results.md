# La-Minks Full-Stack Platform: End-to-End (E2E) Test Report

**Date:** 2026-08-20  
**Test Framework:** [Playwright](https://playwright.dev/) (Chromium)  
**Status:** **100% PASSING (14 / 14 Tests)**  
**Total Execution Time:** ~3.3 minutes  

---

## 1. Executive Summary

A comprehensive automated End-to-End test suite was executed against the **La-Minks Full-Stack Platform** (`http://localhost:3000` with API at `http://localhost:5001/api`). The suite validates critical user journeys across all user personas (**Customer**, **Staff**, **Super Admin**, and **Public/Anonymous visitors**), as well as complex multi-step state machines, form validation, role-based authorization, and legal compliance.

---

## 2. Test Execution Matrix

| # | Test Suite | Test Scenario Description | Target Surface | Status | Duration |
|:---|:---|:---|:---|:---:|:---:|
| 1 | `auth.spec.ts` | Displays validation errors on empty login form submission | `/login` | **PASS** | 7.5s |
| 2 | `auth.spec.ts` | Rejects unauthorized access with incorrect credentials | `/login` | **PASS** | 4.5s |
| 3 | `customer-journey.spec.ts` | Full journey: 6-step quote &rarr; account registration &rarr; customer dashboard | `/quote`, `/register`, `/dashboard` | **PASS** | 36.1s |
| 4 | `home.spec.ts` | Homepage load, hero typography, and main CTA rendering | `/` | **PASS** | 5.5s |
| 5 | `home.spec.ts` | Top navigation routing to full Services catalogue | `/`, `/services` | **PASS** | 10.7s |
| 6 | `public-pages.spec.ts` | About Us company story, quality pillars, and trust stats | `/about` | **PASS** | 7.8s |
| 7 | `public-pages.spec.ts` | Interactive FAQs with live search filter and accordion expansion | `/faqs` | **PASS** | 10.8s |
| 8 | `public-pages.spec.ts` | Contact Us form submission, field validation, and confirmation state | `/contact` | **PASS** | 14.7s |
| 9 | `public-pages.spec.ts` | POPIA Data Privacy Policy compliance and officer details | `/privacy` | **PASS** | 7.9s |
| 10 | `public-pages.spec.ts` | Terms of Service, liability, and Satisfaction Guarantee | `/terms` | **PASS** | 15.9s |
| 11 | `public-pages.spec.ts` | Cookie Policy, classification, and preferences | `/cookies` | **PASS** | 7.9s |
| 12 | `quote.spec.ts` | Multi-step interactive quote calculation engine (6 steps) | `/quote` | **PASS** | 13.4s |
| 13 | `staff-journey.spec.ts` | Staff authentication, assigned jobs portal, profile rendering | `/login`, `/staff` | **PASS** | 10.7s |
| 14 | `superadmin-journey.spec.ts` | Super Admin KPIs, Services, User CRUD, Bookings export, Audit logs, Guide | `/login`, `/admin/*` | **PASS** | 32.1s |

---

## 3. Detailed Journey Coverage

### 3.1 Customer Booking & Account Journey (`customer-journey.spec.ts` & `quote.spec.ts`)
- **Step 1: Service Selection**: Selects from 11 luxury cleaning offerings.
- **Step 2: Service Details**: Handles dynamic service attributes (rooms, bathrooms, square meterage).
- **Step 3: Extras Selection**: Configures optional add-ons (inside fridge, balcony, oven deep-clean).
- **Step 4: Property Address**: Captures street, suburb, city, province, and postal code.
- **Step 5: Schedule & Date Picker**: Interacts with the popover calendar component, dynamically enabling available working time slots.
- **Step 6: Final Review & Price Calculation**: Verifies dynamic subtotal, extras, VAT, and total quote.
- **Registration & Verification**: Submits customer registration form, verifies email verification prompt, and accesses the Customer Bookings Dashboard.

### 3.2 Super Admin Management Journey (`superadmin-journey.spec.ts`)
- **KPI Metrics**: Verifies live revenue counters, total bookings, active services, and staff count.
- **Services Management**: Reviews active services and configuration.
- **Super Admin User Management**: Role filtering (Super Admin, Admin, Staff, Customer), modal user creation, editing user profiles, and password resets.
- **Bookings Management**: Reviews live bookings, updates service status, and validates CSV data export.
- **System Audit Logs**: Inspects immutable audit logs with entity and action filtering.
- **In-App Admin Guide**: Verifies access to the comprehensive admin how-to manual.

### 3.3 Staff Assigned Jobs Journey (`staff-journey.spec.ts`)
- **Staff Authentication**: Logs in using verified staff credentials.
- **My Jobs Portal**: Views assigned cleaning jobs segmented by Today's Jobs, Upcoming Jobs, and Recently Completed.
- **Profile Navigation**: Confirms staff metadata and role badge display.

### 3.4 Public & Legal Portals (`public-pages.spec.ts` & `home.spec.ts`)
- **Navigation & Brand Identity**: Header navigation, sticky scroll backdrop, responsive mobile/desktop menus.
- **About Us**: Company story, 100% vetted specialists badge, 4.9★ customer satisfaction stats.
- **Interactive FAQs**: Real-time keyword filtering and accordion expansion.
- **Contact Us**: Responsive inquiry form with validation and instant feedback.
- **POPIA & Compliance**: POPIA Privacy Policy, Terms of Service, and Cookie Policy.

---

## 4. Test Accounts & Credentials

| Role | Email | Password | Landing Route | Permissions |
|---|---|---|---|---|
| **Super Admin** | `info@cryobyte.co.za` | `L0c@l@6m1n` | `/admin` | Full admin privileges + User CRUD & role assignment |
| **Staff Specialist** | `staff@laminks.co.za` | `L0c@l@6m1n` | `/staff` | View assigned jobs, status tracking, job notes |
| **Customer** | `customer@laminks.co.za` | `L0c@l@6m1n` | `/dashboard` | View booking history, request quotes, account profile |

*Note: Seed accounts can be refreshed at any time by executing `node backend/seed-users.js`.*

---

## 5. How to Run the Tests Locally

### Prerequisites
1. Backend running: `cd backend && npm run dev` (Port 5001)
2. Frontend running: `cd frontend && npm run dev` (Port 3000)

### Running All Tests
```bash
cd frontend
npx playwright test
```

### Running Specific Test Suites
```bash
# Run only customer journeys
npx playwright test e2e/customer-journey.spec.ts

# Run only Super Admin portal tests
npx playwright test e2e/superadmin-journey.spec.ts

# Run only Public & Legal pages
npx playwright test e2e/public-pages.spec.ts
```

### Viewing the Interactive HTML Test Report
```bash
npx playwright show-report
```
