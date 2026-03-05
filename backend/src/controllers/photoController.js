// src/controllers/photoController.js
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { getBucket } from '../utils/gridfs.js';
import Booking from '../models/Booking.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Pipes req.file buffer into GridFS and resolves with the stored file ObjectId.
 * @param {import('multer').File} file
 * @returns {Promise<mongoose.Types.ObjectId>}
 */
function storeFileInGridFS(file) {
    return new Promise((resolve, reject) => {
        const bucket = getBucket();
        const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

        const uploadStream = bucket.openUploadStream(filename, {
            contentType: file.mimetype,
        });

        const readable = Readable.from(file.buffer);
        readable.pipe(uploadStream);

        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
    });
}

// ─── Controllers ────────────────────────────────────────────────────────────

// @desc    Upload a 'before' photo and attach its GridFS id to the booking
// @route   POST /api/bookings/:id/photos/before
// @access  Private / Staff, Admin
export const uploadBeforePhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Send an image in the "file" field.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    try {
        const fileId = await storeFileInGridFS(req.file);

        if (!booking.photos) {
            booking.photos = { before: [], after: [] };
        }
        if (!booking.photos.before) {
            booking.photos.before = [];
        }

        booking.photos.before.push(fileId.toString());
        await booking.save();

        res.status(201).json({
            message: 'Before photo uploaded successfully',
            fileId: fileId.toString(),
            booking,
        });
    } catch (error) {
        console.error("Photo upload error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload an 'after' photo and attach its GridFS id to the booking
// @route   POST /api/bookings/:id/photos/after
// @access  Private / Staff, Admin
export const uploadAfterPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Send an image in the "file" field.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    try {
        const fileId = await storeFileInGridFS(req.file);

        if (!booking.photos) {
            booking.photos = { before: [], after: [] };
        }
        if (!booking.photos.after) {
            booking.photos.after = [];
        }

        booking.photos.after.push(fileId.toString());
        await booking.save();

        res.status(201).json({
            message: 'After photo uploaded successfully',
            fileId: fileId.toString(),
            booking,
        });
    } catch (error) {
        console.error("Photo upload error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Stream a stored photo by its GridFS file ID
// @route   GET /api/photos/:fileId
// @access  Private (any authenticated user)
export const servePhoto = async (req, res) => {
    let fileId;
    try {
        fileId = new mongoose.Types.ObjectId(req.params.fileId);
    } catch {
        return res.status(400).json({ message: 'Invalid file ID format' });
    }

    try {
        const bucket = getBucket();

        // Verify the file exists before opening a stream
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files.length) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const file = files[0];
        res.setHeader('Content-Type', file.contentType || 'image/jpeg');
        res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

        const downloadStream = bucket.openDownloadStream(fileId);
        downloadStream.on('error', () => res.status(500).json({ message: 'Error streaming photo' }));
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a photo from GridFS by its file ID
// @route   DELETE /api/photos/:fileId
// @access  Private / Admin
export const deletePhoto = async (req, res) => {
    let fileId;
    try {
        fileId = new mongoose.Types.ObjectId(req.params.fileId);
    } catch {
        return res.status(400).json({ message: 'Invalid file ID format' });
    }

    try {
        const bucket = getBucket();

        // Verify the file exists
        const files = await bucket.find({ _id: fileId }).toArray();
        if (!files.length) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        await bucket.delete(fileId);

        // Also remove the reference from any booking that holds it
        const fileIdString = fileId.toString();
        await Booking.updateMany(
            { $or: [{ 'photos.before': fileIdString }, { 'photos.after': fileIdString }] },
            {
                $pull: {
                    'photos.before': fileIdString,
                    'photos.after': fileIdString,
                },
            }
        );

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
