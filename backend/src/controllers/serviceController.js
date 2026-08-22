import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';
import AuditLog from '../models/AuditLog.js';
import { invalidatePricingCache } from './quoteController.js';

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).lean();

        const serviceIds = services.map(s => s._id);
        const pricingRules = await PricingRule.find({ serviceId: { $in: serviceIds } }).lean();

        const servicesWithPricing = services.map(service => {
            const rule = pricingRules.find(pr => pr.serviceId.toString() === service._id.toString());
            return {
                ...service,
                pricingRule: rule || null
            };
        });

        res.json(servicesWithPricing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin view of all services (including inactive)
// @route   GET /api/services/admin
// @access  Private/Admin
export const getAdminServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).lean();

        if (service) {
            const pricingRule = await PricingRule.findOne({ serviceId: service._id }).lean();
            service.pricingRule = pricingRule || null;
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
    try {
        const { name, description, basePrice, vatRate, isActive, imageUrl } = req.body;

        const service = new Service({
            name,
            description,
            basePrice,
            vatRate: vatRate !== undefined ? Number(vatRate) : 15,
            isActive,
            imageUrl
        });

        const createdService = await service.save();
        invalidatePricingCache(createdService._id);
        await AuditLog.create({ userId: req.user._id, action: 'CREATE', entityType: 'Service', entityId: createdService._id, details: { name: createdService.name } });
        res.status(201).json(createdService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
    try {
        const { name, description, basePrice, vatRate, isActive, imageUrl } = req.body;

        const service = await Service.findById(req.params.id);

        if (service) {
            service.name = name || service.name;
            service.description = description !== undefined ? description : service.description;
            service.basePrice = basePrice !== undefined ? Number(basePrice) : service.basePrice;
            service.vatRate = vatRate !== undefined ? Number(vatRate) : (service.vatRate !== undefined ? service.vatRate : 15);
            service.isActive = isActive !== undefined ? isActive : service.isActive;
            service.imageUrl = imageUrl || service.imageUrl;

            const updatedService = await service.save();
            invalidatePricingCache(service._id);
            await AuditLog.create({ userId: req.user._id, action: 'UPDATE', entityType: 'Service', entityId: updatedService._id, details: { name: updatedService.name } });
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await Service.deleteOne({ _id: service._id });
            invalidatePricingCache(service._id);
            await AuditLog.create({ userId: req.user._id, action: 'DELETE', entityType: 'Service', entityId: service._id, details: { name: service.name } });
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
