import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";

export function authentifier (req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({
            message: "Access denied. No token"
        });
        return;
    }

    try {
        const SECRET_KEY = process.env.SECRET_JWT!;
        const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Invalid token or expired'
        });
    }
}