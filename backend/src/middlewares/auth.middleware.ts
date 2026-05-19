import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { TokenPayload } from "../types";
import { AppError } from "../utils/AppError";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Not authorized, token not found" });
        }

        const jwtSecret = process.env.SECRET_JWT;
        if (!jwtSecret)
            throw new Error("No SECRET_JWT");
        const verification = jwt.verify(token, jwtSecret) as TokenPayload;

        if (!verification || !verification.id) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = verification
        next()
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}