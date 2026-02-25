import type { Response } from 'express';
import { logger } from '../utils/logger.js';

export abstract class BaseController {
  protected ok<T>(res: Response, dto?: T) {
    const response = {
      success: true,
      data: dto || null,
      meta: { timestamp: new Date().toISOString() }
    };
    res.status(200).json(response);
  }

  protected created<T>(res: Response, dto?: T) {
    const response = {
      success: true,
      data: dto || null,
      meta: { timestamp: new Date().toISOString() }
    };
    res.status(201).json(response);
  }

  protected clientError(res: Response, message?: string) {
    res.status(400).json({
      success: false,
      error: { code: 'ClientError', message: message || 'Bad Request' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  protected unauthorized(res: Response, message?: string) {
    res.status(401).json({
      success: false,
      error: { code: 'Unauthorized', message: message || 'Unauthorized' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  protected forbidden(res: Response, message?: string) {
    res.status(403).json({
      success: false,
      error: { code: 'Forbidden', message: message || 'Forbidden' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  protected notFound(res: Response, message?: string) {
    res.status(404).json({
      success: false,
      error: { code: 'NotFound', message: message || 'Not Found' },
      meta: { timestamp: new Date().toISOString() }
    });
  }

  protected fail(res: Response, error: Error | string) {
    const message = error instanceof Error ? error.message : error.toString();
    logger.error({ err: error }, 'BaseController fail() invoked');
    res.status(500).json({
      success: false,
      error: { code: 'InternalServerError', message },
      meta: { timestamp: new Date().toISOString() }
    });
  }
}
