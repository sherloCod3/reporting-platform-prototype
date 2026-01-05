import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

router.post('/reports/execute', reportController.executeQuery);
router.post('/reports/export-pdf', reportController.exportPdf);

export default router;