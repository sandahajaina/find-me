import { Request, Response } from "express";
import * as blockService from '../services/block.service';
import { AppError } from "../utils/AppError";

export async function blockUser(req: Request, res: Response)
{
    try {
        const { userId } = req.params;
        const id = req.user?.id;
        if (!userId || !id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await blockService.blockUser(id, parseInt(userId as string));
        return res.status(201).json({ result });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}