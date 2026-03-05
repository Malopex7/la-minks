// src/middleware/uploadMiddleware.js
import multer from 'multer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: jpeg, png, webp.`), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter,
});

/**
 * Single-file upload middleware. Expects the form-data field named "file".
 * Attach as route middleware BEFORE the controller handler.
 */
export const uploadPhoto = upload.single('file');
