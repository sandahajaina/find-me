import pool from "../config/db";
import { AppError } from "../utils/AppError";
import { UpdateUserBody } from "../types";
import fs from 'fs/promises';

export async function getUserById(id: number) {
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

export async function updateUser(id: number, data: Partial<UpdateUserBody>) {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (data.username !== undefined) {
        const existing = await pool.query(
            'SELECT id FROM users WHERE username = $1 AND id != $2',
            [data.username, id]
        );
        if (existing.rows.length > 0) {
            throw new AppError("Username already taken", 409);
        }
    }

    const allowedFields = ['username', 'first_name', 'last_name', 'bio', 'gender', 'sexual_preference', 'latitude', 'longitude', 'city'];

    for (const field of allowedFields) {
        if (data[field as keyof UpdateUserBody] !== undefined) {
            fields.push(`${field} = $${index}`);
            values.push(data[field as keyof UpdateUserBody]);
            index++;
        }
    }

    if (fields.length === 0) throw new AppError("No update", 400)

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, username, email, first_name, last_name, gender, sexual_preference, bio, fame_rating, latitude, longitude, city, last_seen_at, is_online, created_at
        `;
    values.push(id);
    const result = await pool.query(query, values);
    return result.rows[0];
}

// if (data.bio !== undefined) {
//     fields.push(`bio = $${index}`);
//     values.push(data.bio);
//     index++;
// }
// if (data.username !== undefined) {
//     fields.push(`username = $${index}`);
//     values.push(data.username);
//     index++;
// }
// if (data.first_name !== undefined) {
//     fields.push(`first_name = $${index}`);
//     values.push(data.first_name);
//     index++;
// }
// if (data.last_name !== undefined) {
//     fields.push(`last_name = $${index}`);
//     values.push(data.last_name);
//     index++;
// }
// if (data.gender !== undefined) {
//     fields.push(`gender = $${index}`);
//     values.push(data.gender);
//     index++;
// }
// if (data.sexual_preference !== undefined) {
//     fields.push(`sexual_preference = $${index}`);
//     values.push(data.sexual_preference);
//     index++;
// }
// if (data.latitude !== undefined) {
//     fields.push(`latitude = $${index}`);
//     values.push(data.latitude);
//     index++;
// }
// if (data.longitude !== undefined) {
//     fields.push(`longitude = $${index}`);
//     values.push(data.longitude);
//     index++;
// }
// if (data.city !== undefined) {
//     fields.push(`city = $${index}`);
//     values.push(data.city);
//     index++;
// }

export async function uploadPhoto(userId: number, filename: string) {
    const checkPhotoNumber = `
        SELECT COUNT(*) FROM photos WHERE user_id = $1
    `;
    const result = await pool.query(checkPhotoNumber, [userId]);
    if (parseInt(result.rows[0].count) >= 5)
        throw new AppError("Maximum photos reached", 400);
    const isProfilePicture = parseInt(result.rows[0].count) === 0;
    const imageUrl = `${process.env.BACKEND_URL}/uploads/photos/${filename}`;
    const updatePhotos = `
        INSERT INTO photos (user_id, image_url, is_profile_picture)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, image_url, is_profile_picture, created_at
    `;
    const updated = await pool.query(updatePhotos, [userId, imageUrl, isProfilePicture])
    return updated.rows[0];
}

export async function deletePhoto(userId: number, photoId: number) {
    const checkPhoto = `
        SELECT * FROM photos WHERE id = $1 AND user_id=$2
    `;
    const result = await pool.query(checkPhoto, [photoId, userId])
    if (result.rows.length === 0) {
        throw new AppError("Picture not found", 404);
    }
    const photo = result.rows[0];
    const filename = photo.image_url.split('/').pop();
    if (!filename) {
        throw new AppError("Invalid image URL", 500);
    }
    const deletePhotoQuery = `
        DELETE FROM photos WHERE id = $1
    `;
    await pool.query(deletePhotoQuery, [photoId])
    const filePath = `/app/uploads/photos/${filename}`;
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(`Failed to delete file ${filePath}:`, error);
    }
    if (photo.is_profile_picture) {
        const remaining = await pool.query(
            'SELECT id FROM photos WHERE user_id = $1 ORDER BY id ASC LIMIT 1',
            [userId]
        );
        if (remaining.rows.length > 0) {
            await pool.query(
                'UPDATE photos SET is_profile_picture = true WHERE id = $1',
                [remaining.rows[0].id]
            );
        }
    }
    return { message: "Photo deleted successfully" };
}


export async function setProfilePicture(userId: number, photoId: number) {
    const checkPhoto = `
        SELECT * FROM photos WHERE id = $1 AND user_id=$2
    `;
    const result = await pool.query(checkPhoto, [photoId, userId])
    if (result.rows.length === 0) {
        throw new AppError("Picture not found", 404);
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'UPDATE photos SET is_profile_picture = false WHERE user_id = $1 AND is_profile_picture = true',
            [userId]
        );
        const updatedPhoto = await client.query(
            'UPDATE photos SET is_profile_picture = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [photoId, userId]
        );
        await client.query('COMMIT');
        return updatedPhoto.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function getUserProfile(currentUserId: number, targetUserId: number)
{
    const isSelfView = currentUserId === targetUserId;

    const checkUserQuery = `
        SELECT id, username, first_name, last_name, gender, sexual_preference, bio, fame_rating, city, last_seen_at, is_online, created_at
        FROM users 
        WHERE id = $1
    `;
    const result = await pool.query(checkUserQuery, [targetUserId]);
    if (result.rows.length === 0) {
        throw new AppError("User not found", 404);
    }

    if (!isSelfView)
    {
        const checkRecentView = `
            SELECT id FROM views 
            WHERE viewer_id = $1 AND viewed_user_id = $2 
            AND viewed_at > NOW() - INTERVAL '2 hours'
       `;
       const recentResult = await pool.query(checkRecentView, [currentUserId, targetUserId])
       if (recentResult.rows.length === 0)
       {
            await pool.query(`INSERT INTO views (viewer_id, viewed_user_id) VALUES ($1, $2)`, [currentUserId, targetUserId]);
            await pool.query(`UPDATE users SET fame_rating = fame_rating + 1 WHERE id = $1`, [targetUserId]);
       }
    }

    const getPhotosQuery = `SELECT id, image_url, is_profile_picture FROM photos WHERE user_id = $1`;
    const photos = await pool.query(getPhotosQuery, [targetUserId]);

    return { ...result.rows[0], photos: photos.rows };
}
