import type { Request, Response, NextFunction } from 'express';
import * as queryService from '../services/query.service.js';
import { htmlToPdf } from '../services/pdf.service.js';

export async function executeQuery(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { query } = req.body;
        const result = await queryService.execute(query);
        res.json(result);
    } catch (error) {
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
            return res.status(400).json({
                success: false,
                message: '❌ HTML é obrigatório'
            });
        }

        const pdf = await htmlToPdf(htmlContent);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio.pdf"');
        res.send(pdf);
    } catch (error) {
        next(error);
    }
}
