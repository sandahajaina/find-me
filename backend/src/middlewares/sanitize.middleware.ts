import { Request, Response, NextFunction } from "express";
import xss from "xss";

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === 'string') {
            result[key] = xss(value);
        } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

export function sanitizeBody(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}