import type { Request, Response, NextFunction } from 'express';
import * as queryService from '../services/query.service.js';
import { htmlToPdf } from '../services/pdf.service.js';
import { ErrorFactory } from '../types/errors.types.js';
import { pdfQueue } from '../queues/pdf.queue.js';

export async function executeQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { query, page = 1, pageSize = 500 } = req.body;
    if (!req.db) {
      throw ErrorFactory.unauthorized('Conexão do cliente não disponível');
    }

    // Parse to ensure they are valid numbers, fallback to defaults if weird values are sent
    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedPageSize = Math.max(1, Math.min(1000, parseInt(pageSize as string, 10) || 500));

    const result = await queryService.execute(query, req.db, parsedPage, parsedPageSize);
    res.json(result);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production' && !(error instanceof ErrorFactory)) {
      console.error('Execute route internal error:', error?.message || error);
    }
    next(error);
  }
}

export async function exportPdf(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      throw ErrorFactory.badRequest('HTML e obrigatorio');
    }

    // Add job to the BullMQ queue instead of synchronous processing
    const job = await pdfQueue.add('generate-pdf', { htmlContent });

    res.json({
      success: true,
      jobId: job.id,
      message: 'PDF generation job started.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getPdfJobStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { jobId } = req.params;
    if (!jobId) throw ErrorFactory.badRequest('Job ID é obrigatório');

    const job = await pdfQueue.getJob(jobId);
    if (!job) throw ErrorFactory.notFound('Job não encontrado');

    const state = await job.getState();
    const progress = job.progress;

    if (state === 'completed') {
      // we return the temporary base64 string
      const resultData = job.returnvalue;
      res.json({
        success: true,
        state,
        progress,
        pdfData: resultData?.pdfData
      });
    } else if (state === 'failed') {
      res.status(500).json({
        success: false,
        state,
        progress,
        error: job.failedReason
      });
    } else {
      res.json({
        success: true,
        state,
        progress
      });
    }
  } catch (error) {
    next(error);
  }
}
