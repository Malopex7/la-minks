import PricingRule from '../models/PricingRule.js';
import Service from '../models/Service.js';

// @desc    Get all pricing rules (optionally filtered by serviceId)
// @route   GET /api/pricing-rules
// @access  Public
export const getPricingRules = async (req, res) => {
    try {
        const { serviceId } = req.query;
        const filter = { isActive: true };

        if (serviceId) {
            filter.serviceId = serviceId;
        }

        const rules = await PricingRule.find(filter).populate('serviceId', 'name basePrice');
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin view of all pricing rules
// @route   GET /api/pricing-rules/admin/all
// @access  Private/Admin
export const getAdminPricingRules = async (req, res) => {
    try {
        const rules = await PricingRule.find({}).populate('serviceId', 'name');
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pricing rule by ID
// @route   GET /api/pricing-rules/:id
// @access  Public
export const getPricingRuleById = async (req, res) => {
    try {
        const rule = await PricingRule.findById(req.params.id).populate('serviceId', 'name basePrice');

        if (rule) {
            res.json(rule);
        } else {
            res.status(404).json({ message: 'Pricing Rule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a pricing rule
// @route   POST /api/pricing-rules
// @access  Private/Admin
export const createPricingRule = async (req, res) => {
    try {
        const { serviceId, name, type, value, description, isActive } = req.body;

        // Verify service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const pricingRule = new PricingRule({
            serviceId,
            name,
            type,
            value,
            description,
            isActive
        });

        const createdRule = await pricingRule.save();
        res.status(201).json(createdRule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a pricing rule
// @route   PUT /api/pricing-rules/:id
// @access  Private/Admin
export const updatePricingRule = async (req, res) => {
    try {
        const { serviceId, name, type, value, description, isActive } = req.body;

        const rule = await PricingRule.findById(req.params.id);

        if (rule) {
            // If serviceId is changing, optionally verify the new service exists
            if (serviceId && serviceId !== rule.serviceId.toString()) {
                const service = await Service.findById(serviceId);
                if (!service) {
                    return res.status(404).json({ message: 'New Service not found' });
                }
                rule.serviceId = serviceId;
            }

            rule.name = name || rule.name;
            rule.type = type || rule.type;
            rule.value = value !== undefined ? value : rule.value;
            rule.description = description !== undefined ? description : rule.description;
            rule.isActive = isActive !== undefined ? isActive : rule.isActive;

            const updatedRule = await rule.save();
            res.json(updatedRule);
        } else {
            res.status(404).json({ message: 'Pricing Rule not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a pricing rule
// @route   DELETE /api/pricing-rules/:id
// @access  Private/Admin
export const deletePricingRule = async (req, res) => {
    try {
        const rule = await PricingRule.findById(req.params.id);

        if (rule) {
            await PricingRule.deleteOne({ _id: rule._id });
            res.json({ message: 'Pricing Rule removed' });
        } else {
            res.status(404).json({ message: 'Pricing Rule not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
