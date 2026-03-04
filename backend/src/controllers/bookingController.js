import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';

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
        const { serviceId, address, property, extrasSelected, schedule } = req.body;

        // Fetch service and pricing rules to calculate amount
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        const pricingRule = await PricingRule.findOne({ serviceId });
        if (!pricingRule) return res.status(404).json({ message: 'Pricing rules not found' });

        // Base Price Calculation
        let baseCost = service.basePrice || 0;
        if (property?.sqm && pricingRule.propertySizeBands?.length > 0) {
            const band = pricingRule.propertySizeBands.find(
                (b) => property.sqm >= b.minSqm && property.sqm <= b.maxSqm
            );
            if (band) baseCost *= band.multiplier;
        }

        if (property?.bedrooms && pricingRule.roomRates?.bedroomRate) {
            baseCost += property.bedrooms * pricingRule.roomRates.bedroomRate;
        }
        if (property?.bathrooms && pricingRule.roomRates?.bathroomRate) {
            baseCost += property.bathrooms * pricingRule.roomRates.bathroomRate;
        }

        if (property?.conditionLevel && pricingRule.conditionMultipliers) {
            const conditionMultiplier = pricingRule.conditionMultipliers[property.conditionLevel] || 1;
            baseCost *= conditionMultiplier;
        }

        // Extras Cost Calculation
        let extrasCost = 0;
        if (extrasSelected && extrasSelected.length > 0 && pricingRule.extras?.length > 0) {
            extrasSelected.forEach((extraName) => {
                const extraRule = pricingRule.extras.find((e) => e.name === extraName);
                if (extraRule) extrasCost += extraRule.price || 0;
            });
        }

        const finalPrice = baseCost + extrasCost;

        const booking = new Booking({
            customerId: req.user._id,
            serviceId,
            address,
            property,
            extrasSelected,
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

        res.json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
