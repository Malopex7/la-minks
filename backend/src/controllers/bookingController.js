import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';
import AuditLog from '../models/AuditLog.js';
import { sendBookingCreatedEmail, sendStaffAssignmentEmail, sendJobCompletionEmail, sendJobCheckInEmail } from '../utils/email.js';

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
        if (booking.customerId.toString() !== req.user._id.toString() && req.user.role === 'customer') {
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

        const booking = new Booking({
            customerId: req.user._id,
            serviceId,
            address,
            serviceDetails,
            extrasSelected,
            aiExtras: aiExtras || [],
            schedule,
            status: 'BOOKED',
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
        sendBookingCreatedEmail(populatedBooking, req.user.email, req.user.firstName).catch(err => console.error('Email failed:', err));

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
