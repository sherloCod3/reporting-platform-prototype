import type { Response } from "express";

export abstract class BaseController {
    /**
     * Send a success response (200 OK)
     */
    protected ok<T>(res: Response, dto?: T) {
        if (dto) {
            res.status(200).json(dto);
        } else {
            res.sendStatus(200);
        }
    }

    /**
     * Send a created response (201 Created)
     */
    protected created<T>(res: Response, dto?: T) {
        if (dto) {
            res.status(201).json(dto);
        } else {
            res.sendStatus(201);
        }
    }

    /**
     * Send a client error response (400 Bad Request)
     */
    protected clientError(res: Response, message?: string) {
        res.status(400).json({
            error: "ClientError",
            message: message || "Bad Request",
        });
    }

    /**
     * Send an unauthorized response (401 Unauthorized)
     */
    protected unauthorized(res: Response, message?: string) {
        res.status(401).json({
            error: "Unauthorized",
            message: message || "Unauthorized",
        });
    }

    /**
     * Send a forbidden response (403 Forbidden)
     */
    protected forbidden(res: Response, message?: string) {
        res.status(403).json({
            error: "Forbidden",
            message: message || "Forbidden",
        });
    }

    /**
     * Send a not found response (404 Not Found)
     */
    protected notFound(res: Response, message?: string) {
        res.status(404).json({
            error: "NotFound",
            message: message || "Not Found",
        });
    }

    /**
     * Send a generic fail response (500 Internal Server Error)
     */
    protected fail(res: Response, error: Error | string) {
        console.error(error); // In production, this should go to Sentry
        res.status(500).json({
            error: "InternalServerError",
            message: error.toString(),
        });
    }
}
