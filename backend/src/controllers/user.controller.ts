import { Request, Response } from "express";
import * as userService from '../services/user.service';
import { AppError } from "../utils/AppError";
import { UpdateUserBody } from "../types";

function validateLocation(latitude?: number, longitude?: number): string | null {
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
        return "Invalid latitude";
    }
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
        return "Invalid longitude";
    }
    return null;
}

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

export async function updateMe(req: Request<{}, {}, UpdateUserBody>, res: Response) {
    try {
        const { username, first_name, last_name, bio, gender, sexual_preference, latitude, longitude, city } = req.body;
        const id = req.user?.id;
        if (!id) {
            return res.status(400).json({
                message: "id not found"
            });
        }

        const locationError = validateLocation(latitude, longitude);
        if (locationError) {
            return res.status(400).json({ message: locationError });
        }

        const data: Partial<UpdateUserBody> = {};
        if (username !== undefined) data.username = username;
        if (first_name !== undefined) data.first_name = first_name;
        if (last_name !== undefined) data.last_name = last_name;
        if (bio !== undefined) data.bio = bio;
        if (gender !== undefined) data.gender = gender;
        if (sexual_preference !== undefined) data.sexual_preference = sexual_preference;
        if (latitude !== undefined) data.latitude = latitude;
        if (longitude !== undefined) data.longitude = longitude;
        if (city !== undefined) data.city = city;

        const user = await userService.updateUser(id, data);
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

export async function uploadPhoto(req: Request, res: Response) {
    try {
        const file = req.file;
        const id = req.user?.id;
        if (!file || !id) {
            return res.status(400).json({
                message: "no file to upload"
            });
        }
        const photo = await userService.uploadPhoto(id, file.filename);
        return res.status(201).json({ photo });
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

export async function deletePhoto(req: Request, res: Response) {
    try {
        const { photoId } = req.params;
        const id = req.user?.id;
        if (!photoId || !id) {
            return res.status(400).json({
                message: "Photo id not found"
            });
        }
        const result = await userService.deletePhoto(id, parseInt(photoId as string));
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

export async function setProfilePicture(req: Request, res: Response) {
    try {
        const { photoId } = req.params;
        const id = req.user?.id;
        if (!photoId || !id) {
            return res.status(400).json({
                message: "Photo id not found"
            });
        }
        const result = await userService.setProfilePicture(id, parseInt(photoId as string));
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

export async function getUserProfile(req: Request, res: Response)
{
    try {
        const { userId } = req.params;
        const viewerId = req.user?.id;
        if (!userId || !viewerId) {
            return res.status(400).json({
                message: "User id not found"
            });
        }
        const result = await userService.getUserProfile(viewerId, parseInt(userId as string))
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