import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from "express";
import { AppError } from '../utils/AppError';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/app/uploads/photos/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (allowedMimeTypes.includes(file.mimetype))
        cb(null, true)
    else {
        cb(new AppError("Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.", 400))
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
