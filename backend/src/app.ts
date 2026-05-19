import express from "express";
import cors from "cors";
import authRoutes from './routes/auth.routes';
import cookieParser from "cookie-parser";

if (!process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL is missing");

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);

export default app;