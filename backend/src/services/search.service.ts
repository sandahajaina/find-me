import pool from "../config/db";
import { SearchFilters } from "../types";

export async function searchUsers(currentUserId: number, filters: SearchFilters){
    const conditions: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (filters.city !== undefined) {
        conditions.push(`u.city ILIKE $${index}`);
        values.push(`%${filters.city}%`);
        index++;
    }

    if (filters.age_min !== undefined) {
        conditions.push(`EXTRACT(YEAR FROM AGE(u.birthdate)) >= $${index}`);
        values.push(filters.age_min);
        index++;
    }

    if (filters.age_max !== undefined) {
        conditions.push(`EXTRACT(YEAR FROM AGE(u.birthdate)) <= $${index}`);
        values.push(filters.age_max);
        index++;
    }

    if (filters.fame_min !== undefined) {
        conditions.push(`u.fame_rating >= $${index}`);
        values.push(filters.fame_min);
        index++;
    }

    if (filters.fame_max !== undefined) {
        conditions.push(`u.fame_rating <= $${index}`);
        values.push(filters.fame_max);
        index++;
    }

    if (filters.tags && filters.tags.length > 0) {
        conditions.push(`(
            SELECT COUNT(*) FROM user_tags ut2
            WHERE ut2.user_id = u.id
            AND ut2.tag_id = ANY($${index})
        ) = $${index + 1}`);
        values.push(filters.tags);
        values.push(filters.tags.length);
        index += 2;
    }

    const whereClause = conditions.length > 0 
        ? 'AND ' + conditions.join(' AND ') 
        : '';

    const query = `
        SELECT 
            u.id, u.username, u.first_name, u.last_name, u.gender,
            u.sexual_preference, u.bio, u.fame_rating, u.city,
            u.birthdate, u.is_online, u.last_seen_at,
            EXTRACT(YEAR FROM AGE(u.birthdate)) AS age
        FROM users u
        WHERE u.id != $${index}
        AND u.is_verified = true
        AND u.id NOT IN (
            SELECT b.blocker_id FROM blocks b WHERE b.blocked_user_id = $${index + 1}
            UNION
            SELECT b.blocked_user_id FROM blocks b WHERE b.blocker_id = $${index + 2}
        )
        ${whereClause}
        ORDER BY u.fame_rating DESC
    `;
    values.push(currentUserId);
    values.push(currentUserId);
    values.push(currentUserId);
    const result = await pool.query(query, values);
    return result.rows;
}
