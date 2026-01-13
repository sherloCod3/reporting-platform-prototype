import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { queryRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.post('/execute', queryRateLimiter, reportController.executeQuery);
router.post('/export-pdf', reportController.exportPdf);

export default router;