import Booking from '../models/Booking.js';

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
        // Implementation will depend on Quote-to-Booking flow details
        const { serviceId, address, property, extrasSelected, schedule } = req.body;

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
                provider: 'PAYSTACK'
            }
        });

        const createdBooking = await booking.save();
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
