import { Router } from 'express';
import express from 'express';
import { ReportController } from '../controllers/ReportController.js';
import { ReportService } from '../services/reportService.js';
import { ReportRepository } from '../repositories/ReportRepository.js';
import { asyncErrorWrapper } from '../utils/asyncErrorWrapper.js';
import * as legacyController from '../controllers/report.controller.js';
import { queryRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/execute', queryRateLimiter, legacyController.executeQuery);

// The PDF export feature takes raw rendered HTML, which can be massive
// 50mb override allows large generated tables to export properly
router.post('/export-pdf', express.json({ limit: '50mb' }), legacyController.exportPdf);

// Composicao de dependencias para esta rota
const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

router.post('/', asyncErrorWrapper(reportController.create));
router.get('/:id', asyncErrorWrapper(reportController.getOne));
router.put('/:id', asyncErrorWrapper(reportController.update));

export default router;
