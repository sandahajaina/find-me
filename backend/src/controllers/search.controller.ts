import { Request, Response } from "express";
import * as searchService from '../services/search.service';
import { AppError } from "../utils/AppError";
import { SearchFilters } from "../types";

export async function searchUsers(req: Request, res: Response){
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "id not found"
            });
        }
    const filters: SearchFilters = {};
    if (req.query.city) filters.city = req.query.city as string;
    if (req.query.age_min) filters.age_min = parseInt(req.query.age_min as string);
    if (req.query.age_max) filters.age_max = parseInt(req.query.age_max as string);
    if (req.query.fame_min) filters.fame_min = parseInt(req.query.fame_min as string);
    if (req.query.fame_max) filters.fame_max = parseInt(req.query.fame_max as string);
    if (req.query.tags) filters.tags = (req.query.tags as string).split(',').map(Number);

        const users = await searchService.searchUsers(id, filters);
        return res.status(200).json({ users });
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