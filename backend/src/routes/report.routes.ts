import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';

const router = Router();

router.post('/execute', reportController.executeQuery);
router.post('/export-pdf', reportController.exportPdf);

export default router;