import jwt from "jsonwebtoken";

if (!process.env.SECRET_JWT)
    throw new Error("SECRET_JWT is missing");

const SECRET_KEY = process.env.SECRET_JWT;

export function genererToken<T extends object>(payload: T): string {
    return jwt.sign(
        payload,
        SECRET_KEY,
        { expiresIn: "7d" }
    );
}