import pool from "../config/db";
import { AppError } from "../utils/AppError";

export async function getUserById(id: number)
{
    const checkUserQuery = `
        SELECT id, username, email, first_name, last_name, gender, sexual_preference, bio, fame_rating, latitude, longitude, city, last_seen_at, is_online, created_at
        FROM users 
        WHERE id = $1
    `;
    const result = await pool.query(checkUserQuery, [id]);
    if (result.rows.length === 0) {
        throw new AppError("User not found", 404);
    }
    return result.rows[0];
}
