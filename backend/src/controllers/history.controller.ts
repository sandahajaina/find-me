import { Request, Response } from "express";
import * as historyService from '../services/history.service';
import { AppError } from "../utils/AppError";

export async function getProfileViews(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await historyService.getProfileViews(id);
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

export async function getProfileLikes(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await historyService.getProfileLikes(id);
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

export async function getProfileMatches(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "Id not found"
            });
        }
        const result = await historyService.getProfileMatches(id);
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