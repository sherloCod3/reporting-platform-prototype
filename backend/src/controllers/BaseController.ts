import type { Response } from 'express';
import { logger } from '../utils/logger.js';

export abstract class BaseController {
  protected ok<T>(res: Response, dto?: T) {
    if (dto) {
      res.status(200).json(dto);
    } else {
      res.sendStatus(200);
    }
  }

  protected created<T>(res: Response, dto?: T) {
    if (dto) {
      res.status(201).json(dto);
    } else {
      res.sendStatus(201);
    }
  }

  protected clientError(res: Response, message?: string) {
    res.status(400).json({
      error: 'ClientError',
      message: message || 'Bad Request'
    });
  }

  protected unauthorized(res: Response, message?: string) {
    res.status(401).json({
      error: 'Unauthorized',
      message: message || 'Unauthorized'
    });
  }

  protected forbidden(res: Response, message?: string) {
    res.status(403).json({
      error: 'Forbidden',
      message: message || 'Forbidden'
    });
  }

  protected notFound(res: Response, message?: string) {
    res.status(404).json({
      error: 'NotFound',
      message: message || 'Not Found'
    });
  }

  protected fail(res: Response, error: Error | string) {
    console.error(error);
    res.status(500).json({
      error: 'InternalServerError',
      message: error.toString()
    });
  }
}
