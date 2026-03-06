import express from 'express';
import { suggestExtra } from '../controllers/aiExtrasController.js';

const router = express.Router();

router.post('/suggest-extra', suggestExtra);

export default router;
