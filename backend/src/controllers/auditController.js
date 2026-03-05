import AuditLog from '../models/AuditLog.js';

// @desc    Get paginated audit logs (admin only)
// @route   GET /api/audit
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 25;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.entityType) filter.entityType = req.query.entityType;
        if (req.query.action) filter.action = new RegExp(req.query.action, 'i');
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .populate('userId', 'firstName lastName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AuditLog.countDocuments(filter),
        ]);

        res.json({
            logs,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
