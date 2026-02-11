import { Router } from 'express';
import reportRoutes from './report.routes.js';
import authRoutes from './auth.routes.js';
import reportDefRoutes from './report-def.routes.js';
import dbRoutes from './db.routes.js';
import { healthCheck } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes); // Execuções
router.use('/definitions', reportDefRoutes); // CRUD de definições
router.use('/db', dbRoutes); // Database connection management

export default router;
