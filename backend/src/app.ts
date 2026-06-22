import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'
import tagRoutes from './routes/tag.routes'
import cookieParser from "cookie-parser";
import { AppError } from "./utils/AppError";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { sanitizeBody } from "./middlewares/sanitize.middleware";

if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL is missing");

const app = express();

app.use(express.json());

app.use(sanitizeBody);

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/uploads', express.static('/app/uploads'));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
});

export default app;
