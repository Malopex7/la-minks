import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.json(services);
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
        const service = await Service.findById(req.params.id);

        if (service) {
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
        const { name, description, basePrice, isActive, imageUrl } = req.body;

        const service = new Service({
            name,
            description,
            basePrice,
            isActive,
            imageUrl
        });

        const createdService = await service.save();
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
        const { name, description, basePrice, isActive, imageUrl } = req.body;

        const service = await Service.findById(req.params.id);

        if (service) {
            service.name = name || service.name;
            service.description = description !== undefined ? description : service.description;
            service.basePrice = basePrice || service.basePrice;
            service.isActive = isActive !== undefined ? isActive : service.isActive;
            service.imageUrl = imageUrl || service.imageUrl;

            const updatedService = await service.save();
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
            // Opting for document removal instead of soft delete initially. 
            // Replace with `service.isActive = false; await service.save();` for soft deletes if needed.
            await Service.deleteOne({ _id: service._id });
            await AuditLog.create({ userId: req.user._id, action: 'DELETE', entityType: 'Service', entityId: service._id, details: { name: service.name } });
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
