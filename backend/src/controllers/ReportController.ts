import type { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import { ReportService } from '../services/reportService.js';
import { ReportSchema } from '../validators/report.schema.js';

export class ReportController extends BaseController {
  constructor(private readonly reportService: ReportService) {
    super();
  }

  create = async (req: Request, res: Response) => {
    const validation = ReportSchema.safeParse(req.body);

    if (!validation.success) {
      return this.clientError(res, validation.error.message);
    }

    const report = await this.reportService.createReport(validation.data);
    return this.created(res, report);
  };

  getOne = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return this.clientError(res, 'Invalid ID');
    }

    try {
      const report = await this.reportService.getReportById(id);
      return this.ok(res, report);
    } catch (error) {
      return this.notFound(res, 'Report not found');
    }
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return this.clientError(res, 'Invalid ID');
    }

    const validation = ReportSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return this.clientError(res, validation.error.message);
    }

    try {
      const report = await this.reportService.updateReport(id, validation.data);
      return this.ok(res, report);
    } catch (error) {
      return this.notFound(res, 'Report not found');
    }
  };
}
