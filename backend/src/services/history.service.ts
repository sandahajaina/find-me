import pool from "../config/db";

export async function getProfileViews(userId: number)
{
    const query = `
    SELECT 
    u.id, u.username, u.first_name, u.last_name, 
    u.is_online, u.last_seen_at,
    v.viewed_at
    FROM views v
    JOIN users u ON u.id = v.viewer_id
    WHERE v.viewed_user_id = $1
    ORDER BY v.viewed_at DESC
    `;
    const result = await pool.query(query, [userId])
    return result.rows
}


export async function getProfileLikes(userId: number)
{
    const getLikesQuery = `
    SELECT 
    u.id, u.username, u.first_name, u.last_name, 
    u.is_online, u.last_seen_at,
    l.created_at
    FROM likes l
    JOIN users u ON u.id = l.liker_id
    WHERE l.liked_user_id = $1
    ORDER BY l.created_at DESC
    `;
    const result = await pool.query(getLikesQuery, [userId])
    return result.rows
}

export async function getProfileMatches(userId: number)
{
    const getMatchQuery = `
    SELECT 
        m.id, m.matched_at,
        u.id as partner_id, u.username, u.first_name, u.last_name,
        u.is_online, u.last_seen_at
    FROM matches m
    JOIN users u ON (
        CASE 
            WHEN m.user1_id = $1 THEN u.id = m.user2_id
            ELSE u.id = m.user1_id
        END
    )
    WHERE m.user1_id = $1 OR m.user2_id = $1
    ORDER BY m.matched_at DESC
    `;
    const result = await pool.query(getMatchQuery, [userId])
    return result.rows
}