import { Router } from 'express';
import { ReportDefinitionController } from '../controllers/report-def.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', ReportDefinitionController.list);
router.post('/', ReportDefinitionController.create);
router.get('/:id', ReportDefinitionController.get);
router.put('/:id', ReportDefinitionController.update);
router.delete('/:id', ReportDefinitionController.delete);

export default router;
