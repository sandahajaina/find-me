import { Request, Response } from "express";
import * as userService from '../services/user.service';
import { AppError } from "../utils/AppError";

export async function getUser(req: Request, res: Response) {

    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "id not found"
            });
        }
        const user = await userService.getUserById(id);
        return res.status(200).json({ user });
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