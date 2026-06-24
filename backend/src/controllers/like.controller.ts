import { Request, Response } from "express";
import * as likeService from '../services/like.service';
import { AppError } from "../utils/AppError";

export async function likeUser(req: Request, res: Response)
{
    try {
        const { userId } = req.params;
        const id = req.user?.id;
        if (!userId || !id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await likeService.likeUser(id, parseInt(userId as string));
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

export async function unlikeUser(req: Request, res: Response)
{
    try {
        const { userId } = req.params;
        const id = req.user?.id;
        if (!userId || !id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await likeService.unlikeUser(id, parseInt(userId as string));
        return res.status(200).json({ result });
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