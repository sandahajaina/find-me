import pool from "../config/db";
import { AppError } from "../utils/AppError";

export async function blockUser(blockerId: number, blockedUserId: number)
{
    if (blockerId === blockedUserId) {
        throw new AppError("You cannot block yourself", 400);
    }
    const checkUser = `
        SELECT * FROM users WHERE id = $1
    `;
    const result = await pool.query(checkUser, [blockedUserId])
    if (result.rows.length === 0) {
        throw new AppError("User id not found", 404);
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO blocks (blocker_id, blocked_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [blockerId, blockedUserId]
        );

        const user1_id = Math.min(blockerId, blockedUserId);
        const user2_id = Math.max(blockerId, blockedUserId);
        await client.query(
            'DELETE FROM matches WHERE (user1_id = $1 AND user2_id = $2)',
            [user1_id, user2_id]
        );

        const deleteLike = await client.query(
            'DELETE FROM likes WHERE liker_id = $1 AND liked_user_id = $2 RETURNING id',
            [blockerId, blockedUserId]
        );

        if (deleteLike.rows.length > 0) {
            await client.query(
                'UPDATE users SET fame_rating = fame_rating - 20 WHERE id = $1',
                [blockedUserId]
            );
        }
        await client.query('COMMIT');
        return { blocked: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}