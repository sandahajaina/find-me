import { Request, Response } from "express";
import { LoginBody, RegisterBody, VerifyEmailParams } from "../types";
import * as authService from '../services/auth.service';
import { AppError } from "../utils/AppError";

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
    if (password.length < 8)
        return "Password must be at least 8 characters";

    if (!/[A-Z]/.test(password))
        return "Password must contain at least one uppercase letter";

    if (!/[a-z]/.test(password))
        return "Password must contain at least one lowercase letter";

    if (!/\d/.test(password))
        return "Password must contain at least one number";

    if (!/[\W_]/.test(password))
        return "Password must contain at least one special character";

    return null;
}

export async function registerUser(
    req: Request<{}, {}, RegisterBody >, 
    res: Response
): Promise<Response> {

    try {
        const { username, email, last_name, first_name, password } = req.body;

        if (!username || !email || !last_name || !first_name || !password) {
            return res.status(400).json({ 
                message: "Missing fields"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const passwordError = validatePassword(password);

        if (passwordError) {
            return res.status(400).json({
                message: passwordError
            });
        }

        await authService.registerUser({
            username,
            email,
            last_name,
            first_name,
            password
        });

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message : error.message
            });
        }
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function verifyEmail(req: Request<VerifyEmailParams>, res: Response) {

    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({
                message: "Token is missing"
            });
        }
        await authService.verifyEmail(token);
        return res.status(200).json({message: "Email verified successfully"});
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

export async function loginUser(req: Request<{}, {}, LoginBody>, res: Response) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Missing fields"
            })
        }
        const user = await authService.loginUser({username, password});
        res.cookie(
            'token', user.tokenJwt, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            message: `Welcome ${user.username}`
        });
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