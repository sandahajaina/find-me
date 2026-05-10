import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.POSTGRES_PORT)
    throw new Error("POSTGRES_PORT is missing");

if (!process.env.POSTGRES_USER)
    throw new Error("POSTGRES_USER is missing");

if (!process.env.POSTGRES_PASSWORD)
    throw new Error("POSTGRES_PASSWORD is missing");

if (!process.env.POSTGRES_DB)
    throw new Error("POSTGRES_DB is missing");

const port = process.env.POSTGRES_PORT;

const pool = new Pool({
    host: 'db',
    port: Number(port),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

export async function connectDB(): Promise<void> {
    try {
        await pool.query("SELECT NOW()");
        console.log("DB connected successfully");
    }
    catch (error) {
        console.error("DB connection failed:", error);
        throw error;
    }
}

export default pool;