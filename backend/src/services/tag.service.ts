import pool from "../config/db";
import { AppError } from "../utils/AppError";

export async function getTags()
{
    const showTagsQuery = `
        SELECT id, name FROM tags ORDER BY name ASC
    `;
    const result = await pool.query(showTagsQuery)
    return result.rows
}

export async function getUserTags(userId: number)
{
    const getTagsQuery = `
        SELECT t.id, t.name 
        FROM tags t
        JOIN user_tags ut ON t.id = ut.tag_id
        WHERE ut.user_id = $1
    `;
    const result = await pool.query(getTagsQuery, [userId])
    return result.rows
}

export async function addTag(userId: number, tagId: number)
{
    const checkTagQuery = `
        SELECT * FROM tags WHERE id = $1
    `; 
    const result = await pool.query(checkTagQuery, [tagId])
    if (result.rows.length === 0) {
        throw new AppError("Tag not found", 404)
    }
    
    const addTagQuery = `
        INSERT INTO user_tags (user_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `;
    await pool.query(addTagQuery, [userId, tagId])
    return { message: "Tag added successfully" };
}

export async function removeTag(userId: number, tagId: number)
{
    const checkTagQuery = `
        SELECT * FROM tags WHERE id = $1
    `; 
    const result = await pool.query(checkTagQuery, [tagId])
    if (result.rows.length === 0) {
        throw new AppError("Tag not found", 404)
    }

    const deleteTagQuery = `
        DELETE FROM user_tags WHERE user_id = $1 AND tag_id = $2
    `;
    await pool.query(deleteTagQuery, [userId, tagId])
    return { message: "Tag removed successfully" };
}