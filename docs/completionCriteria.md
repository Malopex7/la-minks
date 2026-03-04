# Completion Criteria

Before this project is considered production-ready, all of the following must be fully functional and tested:

## 1. Authentication
- [ ] Users can register and login securely.
- [ ] Passwords are hashed using bcrypt.
- [ ] JWT access and refresh tokens are functioning.
- [ ] Role-based access control (Admin, Staff, Customer) completely restricts unauthorized endpoints.

## 2. Public Facing & Quotes
- [ ] All 12 specific cleaning services are displayed.
- [ ] The 6-step quote wizard correctly calculates pricing server-side based on size, bedrooms, condition, and extras.

## 3. Booking & Payments
- [ ] Customers can create bookings.
- [ ] Paystack correctly initializes payments in ZAR (cents).
- [ ] Callbacks verify transactions successfully.
- [ ] Bookings transition states accurately (QUOTE -> BOOKED -> CONFIRMED -> IN_PROGRESS -> COMPLETED).

## 4. Staff Portal & Files
- [ ] Staff can view assigned jobs.
- [ ] Staff can upload before/after photos (stored securely in MongoDB GridFS).
- [ ] Staff can complete checklists and mark jobs complete.

## 5. Admin Dashboard
- [ ] Admin can perform full CRUD on Services, Pricing, and Staff.
- [ ] Admin can assign staff to CONFIRMED bookings.
- [ ] Revenue and booking stats display accurately.
- [ ] CSV reports can be generated and downloaded.

## 6. Notifications
- [ ] Nodemailer successfully sends emails for booked, paid, assigned, and completed statuses.

## 7. Quality & Code Standards
- [ ] No placeholders exist in the codebase.
- [ ] Zod is actively validating all inputs on both frontend and backend.
- [ ] Full error handling is present on all API routes.
- [ ] No Docker dependencies.
- [ ] Seed script successfully populates default required data.
