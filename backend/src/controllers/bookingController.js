import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';
import AuditLog from '../models/AuditLog.js';
import { sendBookingCreatedEmail, sendQuoteEmail, sendStaffAssignmentEmail, sendJobCompletionEmail, sendJobCheckInEmail } from '../utils/email.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a timeSlot string like "09:00 AM - 11:00 AM" into Date objects
 * anchored to the given booking date.
 */
const parseSlotTimes = (date, timeSlot) => {
    if (!date || !timeSlot) return null;
    const [startStr, endStr] = timeSlot.split(' - ');
    const toMs = (str, baseDate) => {
        const [time, meridiem] = str.trim().split(' ');
        let [h, m] = time.split(':').map(Number);
        if (meridiem === 'PM' && h !== 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;
        const d = new Date(baseDate);
        d.setHours(h, m, 0, 0);
        return d;
    };
    return { start: toMs(startStr, date), end: toMs(endStr, date) };
};

/**
 * Returns true if the two time ranges overlap (exclusive on boundaries).
 */
const timesOverlap = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

/**
 * Check whether any of the given staffIds already have a booking on the same
 * date whose time slot overlaps with the proposed slot.
 * Pass excludeBookingId to skip the booking being updated (for re-assignments).
 */
const hasStaffConflict = async (staffIds, date, timeSlot, excludeBookingId = null) => {
    if (!staffIds?.length || !date || !timeSlot) return [];

    const proposed = parseSlotTimes(date, timeSlot);
    if (!proposed) return [];

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const query = {
        staffAssignedIds: { $in: staffIds },
        'schedule.date': { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ['CANCELLED', 'COMPLETED', 'QUOTE'] },
    };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const existing = await Booking.find(query).lean();
    const conflicts = [];

    for (const bk of existing) {
        const slot = parseSlotTimes(bk.schedule.date, bk.schedule.timeSlot);
        if (!slot) continue;
        if (timesOverlap(proposed.start, proposed.end, slot.start, slot.end)) {
            conflicts.push(bk);
        }
    }
    return conflicts;
};

/**
 * Check whether the same customer already has a booking at the same address
 * on the same date/time (different service or different address allowed).
 */
const hasCustomerAddressConflict = async (customerId, address, date, timeSlot, excludeBookingId = null) => {
    if (!customerId || !address || !date || !timeSlot) return false;

    const proposed = parseSlotTimes(date, timeSlot);
    if (!proposed) return false;

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const query = {
        customerId,
        'address.line1': address.line1,
        'address.suburb': address.suburb,
        'schedule.date': { $gte: dayStart, $lte: dayEnd },
        status: { $nin: ['CANCELLED', 'COMPLETED', 'QUOTE'] },
    };
    if (excludeBookingId) query._id = { $ne: excludeBookingId };

    const existing = await Booking.find(query).lean();
    for (const bk of existing) {
        const slot = parseSlotTimes(bk.schedule.date, bk.schedule.timeSlot);
        if (!slot) continue;
        if (timesOverlap(proposed.start, proposed.end, slot.start, slot.end)) return true;
    }
    return false;
};

// ────────────────────────────────────────────────────────────────────────────

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('serviceId', 'name icon baseRate')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get booking by ID (only if it belongs to the user)
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('serviceId', 'name icon baseRate description')
            .populate('customerId', 'firstName lastName email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if the booking belongs to the logged-in user, or if staff/admin
        // Note: customerId is populated, so it's an object, not just an ID string
        const bookingCustomerId = booking.customerId?._id ? booking.customerId._id.toString() : booking.customerId?.toString();

        if (bookingCustomerId !== req.user._id.toString() && req.user.role === 'customer') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new booking (basic stub for later use if needed, quote flow usually initializes this)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        if (req.user && req.user.role === 'staff') {
            return res.status(403).json({ message: 'Cleaner and staff accounts are not authorized to create quotes or bookings.' });
        }

        const { serviceId, address, serviceDetails, extrasSelected, aiExtras, schedule } = req.body;

        // Fetch service and pricing rules to calculate amount
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        const pricingRule = await PricingRule.findOne({ serviceId });
        if (!pricingRule) return res.status(404).json({ message: 'Pricing rules not found' });

        // Base Price Calculation
        let baseCost = service.basePrice || 0;

        if (serviceDetails && pricingRule.baseCalculators?.length > 0) {
            pricingRule.baseCalculators.forEach(calc => {
                const inputValue = serviceDetails[calc.inputName];
                if (inputValue && typeof inputValue === 'number') {
                    baseCost += (inputValue * calc.multiplierRate);
                }
            });
        }

        if (serviceDetails?.conditionLevel && pricingRule.conditionMultipliers) {
            const conditionMultiplier = pricingRule.conditionMultipliers[serviceDetails.conditionLevel] || 1;
            baseCost *= conditionMultiplier;
        }

        // Extras Cost Calculation
        let extrasCost = 0;
        if (extrasSelected && extrasSelected.length > 0) {
            extrasSelected.forEach((extraName) => {
                let extraRule = pricingRule.extras?.find((e) => e.name === extraName);
                if (!extraRule && aiExtras && aiExtras.length > 0) {
                    extraRule = aiExtras.find((e) => e.name === extraName);
                }
                if (extraRule) extrasCost += extraRule.price || 0;
            });
        }

        const finalPrice = baseCost + extrasCost;

        // ── Double-booking checks ──────────────────────────────────────────
        // 1. Same customer, same address, overlapping time → block
        if (schedule?.date && schedule?.timeSlot) {
            const customerConflict = await hasCustomerAddressConflict(
                req.user._id, address, schedule.date, schedule.timeSlot
            );
            if (customerConflict) {
                return res.status(409).json({
                    message: 'You already have a booking at this address during the selected time slot. Please choose a different time or address.'
                });
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        const targetStatus = req.body.status === 'QUOTE' ? 'QUOTE' : 'BOOKED';

        const booking = new Booking({
            customerId: req.user._id,
            serviceId,
            address,
            serviceDetails,
            extrasSelected,
            aiExtras: aiExtras || [],
            schedule,
            status: targetStatus,
            payment: {
                status: 'UNPAID',
                provider: 'PAYSTACK',
                amount: finalPrice,
                currency: 'ZAR'
            }
        });

        const createdBooking = await booking.save();

        // Populate service name for the email
        const populatedBooking = await Booking.findById(createdBooking._id).populate('serviceId', 'name');

        // Audit log
        AuditLog.create({ userId: req.user._id, action: 'CREATE', entityType: 'Booking', entityId: createdBooking._id, details: { status: createdBooking.status, totalPrice: finalPrice } }).catch(() => { });

        // Send Email Notification async
        if (targetStatus === 'QUOTE') {
            sendQuoteEmail(populatedBooking, req.user.email, req.user.firstName).catch(err => console.error('Quote Email failed:', err));
        } else {
            sendBookingCreatedEmail(populatedBooking, req.user.email, req.user.firstName).catch(err => console.error('Email failed:', err));
        }

        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('customerId', 'firstName lastName email phone role')
            .populate('serviceId', 'name icon baseRate')
            .populate('staffAssignedIds', 'firstName lastName email phone')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin/Staff
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate the status is allowed based on the schema enum
        const validStatuses = ['QUOTE', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        booking.status = status;
        const updatedBooking = await booking.save();
        AuditLog.create({ userId: req.user._id, action: 'STATUS_CHANGE', entityType: 'Booking', entityId: updatedBooking._id, details: { status } }).catch(() => { });
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign staff to a booking
// @route   PUT /api/bookings/:id/assign-staff
// @access  Private/Admin
export const assignStaffToBooking = async (req, res) => {
    try {
        const { staffIds } = req.body; // Expecting an array of user IDs

        if (!Array.isArray(staffIds)) {
            return res.status(400).json({ message: 'staffIds must be an array of user IDs' });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // ── Staff conflict check ───────────────────────────────────────────
        if (booking.schedule?.date && booking.schedule?.timeSlot && staffIds.length > 0) {
            const conflicts = await hasStaffConflict(
                staffIds,
                booking.schedule.date,
                booking.schedule.timeSlot,
                booking._id  // exclude the current booking itself
            );
            if (conflicts.length > 0) {
                const conflictDates = [...new Set(conflicts.map(c => {
                    const d = new Date(c.schedule.date);
                    return `${d.toLocaleDateString('en-ZA')} ${c.schedule.timeSlot}`;
                }))];
                return res.status(409).json({
                    message: `One or more selected staff members already have a booking during this time slot (${conflictDates.join(', ')}). Please reassign or choose a different time.`
                });
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        booking.staffAssignedIds = staffIds;
        const updatedBooking = await booking.save();

        // Populate newly assigned staff for response
        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('staffAssignedIds', 'firstName lastName email phone');

        // Send Emails to assigned staff async
        if (populatedBooking && populatedBooking.staffAssignedIds.length > 0) {
            populatedBooking.staffAssignedIds.forEach(staff => {
                sendStaffAssignmentEmail(populatedBooking, staff.email, staff.firstName)
                    .catch(err => console.error('Assignment Email failed:', err));
            });
        }

        AuditLog.create({ userId: req.user._id, action: 'STAFF_ASSIGNED', entityType: 'Booking', entityId: populatedBooking._id, details: { staffIds } }).catch(() => { });
        res.json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings assigned to logged-in staff
// @route   GET /api/bookings/staff-assigned
// @access  Private/Staff
export const getStaffAssignments = async (req, res) => {
    try {
        const bookings = await Booking.find({ staffAssignedIds: req.user._id })
            .populate('customerId', 'firstName lastName email phone')
            .populate('serviceId', 'name icon baseRate description')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update staff-specific booking details (status, checklist, notes)
// @route   PUT /api/bookings/:id/staff-update
// @access  Private/Staff
export const updateStaffBooking = async (req, res) => {
    try {
        const { status, checklist, notesStaff } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify that the logged in staff member is assigned to this booking
        if (!booking.staffAssignedIds.includes(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        if (status) {
            const validStatuses = ['IN_PROGRESS', 'COMPLETED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Staff can only set status to IN_PROGRESS or COMPLETED' });
            }
            booking.status = status;
        }

        if (checklist !== undefined) {
            booking.checklist = checklist;
        }

        if (notesStaff !== undefined) {
            booking.notesStaff = notesStaff;
        }

        const updatedBooking = await booking.save();

        // Send notification emails based on status transition
        if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
            const populatedBooking = await Booking.findById(updatedBooking._id).populate('customerId', 'firstName email');
            if (populatedBooking && populatedBooking.customerId) {
                if (status === 'IN_PROGRESS') {
                    sendJobCheckInEmail(populatedBooking, populatedBooking.customerId.email, populatedBooking.customerId.firstName)
                        .catch(err => console.error('Check-in Email failed:', err));
                } else {
                    sendJobCompletionEmail(populatedBooking, populatedBooking.customerId.email, populatedBooking.customerId.firstName)
                        .catch(err => console.error('Completion Email failed:', err));
                }
            }
        }

        if (status) {
            AuditLog.create({ userId: req.user._id, action: 'STATUS_CHANGE', entityType: 'Booking', entityId: updatedBooking._id, details: { status, updatedBy: 'staff' } }).catch(() => { });
        }

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
