import { Router } from "express";
import { ReportController } from "../controllers/ReportController.js";
import { ReportService } from "../services/reportService.js";
import { ReportRepository } from "../repositories/ReportRepository.js";
import { asyncErrorWrapper } from "../utils/asyncErrorWrapper.js";
// Legacy imports
import * as legacyController from '../controllers/report.controller.js';
import { queryRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Legacy Routes
router.post('/execute', queryRateLimiter, legacyController.executeQuery);
router.post('/export-pdf', legacyController.exportPdf);

// Dependency Injection Composition Root (for this route)
const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

router.post("/", asyncErrorWrapper(reportController.create));
router.get("/:id", asyncErrorWrapper(reportController.getOne));
router.put("/:id", asyncErrorWrapper(reportController.update));

export default router;
