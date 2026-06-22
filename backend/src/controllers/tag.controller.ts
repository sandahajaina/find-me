import { Request, Response } from "express";
import * as tagService from '../services/tag.service';
import { AppError } from "../utils/AppError";

export async function getTags(req: Request,res: Response)
{
    try {
        const tags = await tagService.getTags();
        return res.status(200).json({ tags });
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

export async function getUserTags(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "id not found"
            });
        }
        const tags = await tagService.getUserTags(id);
        return res.status(200).json({ tags });
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

export async function addUserTags(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        const { tagId } = req.body;
        if (!id || !tagId) {
            return res.status(400).json({
                message: "id not found"
            });
        }
        await tagService.addTag(id, tagId);
        return res.status(201).json({ message: "Tag added successfully" });
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

export async function removeUserTag(req: Request, res: Response)
{
    try {
        const id = req.user?.id;
        const { tagId } = req.params;
        if (!id || !tagId) {
            return res.status(400).json({
                message: "id not found"
            });
        }
        const result = await tagService.removeTag(id, parseInt(tagId as string));
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