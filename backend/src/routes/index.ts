import { Router } from 'express';
import reportRoutes from './report.routes.js';
import { healthCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', healthCheck);
router.use('/reports', reportRoutes);

export default router;
