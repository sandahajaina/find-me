import pool from "../config/db";
import { AppError } from "../utils/AppError";

export async function likeUser(likerId: number, likedUserId: number) {
    if (likerId === likedUserId) {
        throw new AppError("You cannot like yourself", 400);
    }

    const checkUser = `
        SELECT * FROM users WHERE id = $1
    `;
    const result = await pool.query(checkUser, [likedUserId])
    if (result.rows.length === 0) {
        throw new AppError("User id not found", 404);
    }

    const checkPhoto = `
        SELECT id FROM photos WHERE user_id = $1 AND is_profile_picture = true
    `;
    const photoResult = await pool.query(checkPhoto, [likerId]);
    if (photoResult.rows.length === 0) {
        throw new AppError("You must have a profile picture to like someone", 403);
    }

    const checkTargetPhoto = `
        SELECT id FROM photos WHERE user_id = $1 AND is_profile_picture = true
    `;
    const targetPhotoResult = await pool.query(checkTargetPhoto, [likedUserId]);
    if (targetPhotoResult.rows.length === 0) {
        throw new AppError("This user has no profile picture", 403);
    }

    const checkLike = `
        SELECT * FROM likes WHERE liker_id = $1 AND liked_user_id = $2
    `;

    const likeResult = await pool.query(checkLike, [likerId, likedUserId])
    if (likeResult.rows.length > 0) {
        throw new AppError("User already liked", 400);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'INSERT INTO likes (liker_id, liked_user_id) VALUES ($1, $2)',
            [likerId, likedUserId]
        );

        await client.query(
            'UPDATE users SET fame_rating = fame_rating + 20 WHERE id = $1',
            [likedUserId]
        );

        const mutualCheck = await client.query(
            'SELECT id FROM likes WHERE liker_id = $1 AND liked_user_id = $2',
            [likedUserId, likerId]
        );

        let isMatch = false;
        if (mutualCheck.rows.length > 0) {
            const user1_id = Math.min(likerId, likedUserId);
            const user2_id = Math.max(likerId, likedUserId);
            await client.query(
                'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)',
                [user1_id, user2_id]
            );
            isMatch = true;
        }

        await client.query('COMMIT');
        return { liked: true, match: isMatch };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function unlikeUser(likerId: number, likedUserId: number)
{
    if (likerId === likedUserId) {
        throw new AppError("You cannot unlike yourself", 400);
    } 

    const checkLike = `
        SELECT * FROM likes WHERE liker_id = $1 AND liked_user_id = $2
    `;

    const likeResult = await pool.query(checkLike, [likerId, likedUserId])
    if (likeResult.rows.length === 0) {
        throw new AppError("You didn't like that user", 404);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            `DELETE FROM likes WHERE liker_id = $1 AND liked_user_id = $2`,
            [likerId, likedUserId]
        );

        await client.query(
            `UPDATE users SET fame_rating = fame_rating - 20 WHERE id = $1`,
            [likedUserId]
        );
        const user1_id = Math.min(likerId, likedUserId);
        const user2_id = Math.max(likerId, likedUserId);
        await client.query(
            `DELETE FROM matches WHERE user1_id = $1 AND user2_id = $2`,
            [user1_id, user2_id]
        );

        await client.query('COMMIT');
        return { unliked: true };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
