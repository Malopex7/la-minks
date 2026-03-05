// src/utils/gridfs.js
import { GridFSBucket } from 'mongodb';

/** @type {GridFSBucket | null} */
let bucket = null;

/**
 * Call once inside mongoose.connection.once('open') or .then() after connect.
 * @param {import('mongoose').Connection['db']} db
 */
export function initBucket(db) {
    bucket = new GridFSBucket(db, { bucketName: 'media' });
    console.log('GridFS bucket ready');
}

/**
 * Returns the shared GridFSBucket instance.
 * Throws if the bucket has not yet been initialised.
 */
export function getBucket() {
    if (!bucket) {
        throw new Error('GridFS bucket not initialised. Call initBucket() first.');
    }
    return bucket;
}
