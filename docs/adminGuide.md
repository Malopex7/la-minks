# La-Minks Administrator Guide & How-To Manual

Welcome to the **La-Minks Cleaning Services Admin Portal**. This guide provides step-by-step instructions for managing services, bookings, staff dispatch, quality audits, and payment tracking.

---

## 📑 Table of Contents
1. [Logging into the Admin Dashboard](#1-logging-into-the-admin-dashboard)
2. [Dashboard Overview & Metrics](#2-dashboard-overview--metrics)
3. [Managing Cleaning Services](#3-managing-cleaning-services)
4. [Managing Bookings & Assigning Staff](#4-managing-bookings--assigning-staff)
5. [Reviewing Service Photos & Quality Inspection](#5-reviewing-service-photos--quality-inspection)
6. [Exporting Booking Reports (CSV)](#6-exporting-booking-reports-csv)
7. [System Audit Logs](#7-system-audit-logs)
8. [Troubleshooting & FAQs](#8-troubleshooting--faqs)

---

## 1. Logging into the Admin Dashboard

1. Navigate to [`http://localhost:3000/login`](http://localhost:3000/login).
2. Enter your admin credentials (e.g. `info@cryobyte.co.za`).
3. Upon successful login, click **Admin Dashboard** in the top navigation or navigate directly to [`/admin`](http://localhost:3000/admin).
4. To sign out, click the **Sign Out** button located in the top navigation bar or at the bottom of the left sidebar.

---

## 2. Dashboard Overview & Metrics

The **Admin Overview** (`/admin`) delivers real-time operational insights:

- **Total Services:** Count of all configured cleaning offerings (and how many are currently active for customer booking).
- **Total Bookings:** Lifetime count of all customer reservations across all statuses.
- **Pending Bookings:** Bookings currently awaiting confirmation or staff assignment.
- **Completed Revenue:** Total ZAR revenue generated from jobs marked as `COMPLETED`.
- **Recent Bookings Table:** A quick-look table of the 5 most recent customer bookings with direct status badges and calculated amounts.

---

## 3. Managing Cleaning Services

Navigate to **Services** in the sidebar (`/admin/services`) to manage your service catalog:

### 3.1 Adding a New Service
1. Click the **+ Add Service** button in the top right.
2. Complete the service details:
   - **Service Name:** (e.g. *Deep Carpet Sanitization*)
   - **Base Rate (ZAR):** Base starting price in Rands (e.g. `450.00`).
   - **Description:** Clear summary of what the service covers.
   - **Active Toggle:** Enable to make the service immediately selectable on the public website and quote calculator.
3. Click **Save Service**.

### 3.2 Editing or Deactivating a Service
1. Locate the service card or row in the list.
2. Click **Edit** to modify pricing, description, or toggle the **Active Status**.
3. *Note:* Deactivating a service hides it from customer quote options without deleting past booking records.

---

## 4. Managing Bookings & Assigning Staff

Navigate to **Bookings** in the sidebar (`/admin/bookings`).

### 4.1 Understanding Booking Statuses
| Status | Meaning | Typical Next Action |
|---|---|---|
| `QUOTE` | Customer initiated quote calculation | Awaiting customer confirmation |
| `BOOKED` | Customer submitted booking & schedule | Assign staff and confirm slot |
| `CONFIRMED` | Staff assigned & slot locked | Staff dispatches on scheduled date |
| `IN_PROGRESS` | Staff arrived on site & started cleaning | Staff follows checklist & takes before photos |
| `COMPLETED` | Job finished, quality check done | Payment settlement & receipt email |
| `CANCELLED` | Booking cancelled by customer or admin | Slot released |

### 4.2 Assigning Staff to a Job
1. In the **Assigned Staff** column for any booking, click the staff dropdown (`Select Staff`).
2. Select an active staff member (e.g. *Sarah Dlamini*).
3. **Conflict Detection:** The system automatically checks the staff member's schedule. If the staff member is already assigned to another job during the same time slot, the system will block the assignment and display a conflict alert.
4. Once assigned, an automated email notification is dispatched to the staff member with the job address, time slot, and customer details.

### 4.3 Updating Booking Status
1. Click the **Status dropdown** next to the price in the booking row.
2. Select the updated status (`CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, etc.).
3. The change is immediately saved and logged in the system Audit Log.

---

## 5. Reviewing Service Photos & Quality Inspection

La-Minks incorporates before-and-after photo verification to maintain hospitality-grade standards:

1. Look for the **Photos** column in the Bookings table (e.g. `2 before / 2 after`).
2. Click the chevron arrow (`⌄`) at the end of the row to expand the photo inspection drawer.
3. Click any thumbnail to open the high-resolution **Photo Lightbox** to inspect cleanliness before and after the job.

---

## 6. Exporting Booking Reports (CSV)

For accounting, tax compliance, or external reporting:

1. Go to [`/admin/bookings`](http://localhost:3000/admin/bookings).
2. Click the green **Export CSV** button in the upper right corner.
3. The system generates a timestamped `.csv` file (`laminks-bookings-YYYY-MM-DD.csv`) containing:
   - Customer name, email, phone
   - Service name & property specifications (bedrooms, bathrooms, condition)
   - Selected extras & AI-detected extras
   - Schedule date, time slot, estimated hours
   - Full service address (street, suburb, city, postal code)
   - Payment status, amount in Rands, and Paystack reference
   - Assigned staff members and photo verification counts

---

## 7. System Audit Logs

Navigate to **Audit Log** in the sidebar (`/admin/audit`):

- Tracks every critical event (e.g., booking creation, status changes, staff assignments, service pricing updates).
- **Filter by Entity Type:** Filter specifically by `Booking`, `Service`, `PricingRule`, or `User`.
- **Search by Action:** Filter by action names such as `STATUS_CHANGE`, `STAFF_ASSIGNED`, or `CREATE`.
- **Traceability:** Displays the timestamp, responsible user, entity ID, and raw event parameters for accountability.

---

## 8. Troubleshooting & FAQs

### Q: Why did a staff assignment fail?
**A:** The system detected a scheduling conflict. A single staff member cannot be assigned to overlapping time slots on the same day. Choose a different staff member or adjust the booking schedule.

### Q: How do I refund or adjust a booking payment?
**A:** Payments are processed via Paystack. Locate the Paystack Reference in the booking export or booking details, and manage transactions directly through the Paystack Merchant Dashboard.

### Q: What should I do if a customer requests data deletion?
**A:** Under South African POPIA regulations, customers may request account deletion. Contact the system administrator or remove the user account from the database after verifying no active bookings are pending.

---

*For technical support or infrastructure inquiries, contact: `support@cryobyte.co.za`*
