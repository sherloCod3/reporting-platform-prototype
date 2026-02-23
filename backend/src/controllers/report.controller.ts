import type { Request, Response, NextFunction } from 'express';
import * as queryService from '../services/query.service.js';
import { htmlToPdf } from '../services/pdf.service.js';
import { ErrorFactory } from '../types/errors.types.js';

export async function executeQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { query } = req.body;
    if (!req.db) {
      throw ErrorFactory.unauthorized('Conexão do cliente não disponível');
    }
    const result = await queryService.execute(query, req.db);
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
    const pdf = await htmlToPdf(htmlContent);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="relatorio.pdf"'
    );
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}
