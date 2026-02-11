import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { queryRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate); // tudo abaixo exige token

router.post('/execute', queryRateLimiter, reportController.executeQuery);
router.post('/export-pdf', reportController.exportPdf);

export default router;