import pool from "../config/db";
import { haversineDistance } from "../utils/geo.utils";

export async function getSuggestions(userId: number)
{
    const getMeQuery = `
        SELECT id, gender, sexual_preference, latitude, longitude
        FROM users WHERE id = $1
    `;
    const meResult = await pool.query(getMeQuery, [userId]);
    const me = meResult.rows[0];

    const getSuggestionsQuery = `
    SELECT 
        u.id, u.username, u.first_name, u.last_name, u.gender,
        u.sexual_preference, u.bio, u.fame_rating, u.city,
        u.latitude, u.longitude, u.is_online, u.last_seen_at,
        COUNT(DISTINCT ut.tag_id) AS common_tags
    FROM users u
    LEFT JOIN user_tags ut ON ut.user_id = u.id 
        AND ut.tag_id IN (
            SELECT tag_id FROM user_tags WHERE user_id = $1
        )
    WHERE u.id != $1                          
    AND u.is_verified = true                  
    AND EXISTS (                              
        SELECT 1 FROM photos p 
        WHERE p.user_id = u.id AND p.is_profile_picture = true
    )
    AND u.id NOT IN (
        SELECT b.blocker_id FROM blocks b WHERE b.blocked_user_id = $1
        UNION
        SELECT b.blocked_user_id FROM blocks b WHERE b.blocker_id = $1
    )
    AND u.id NOT IN (
        SELECT l.liked_user_id FROM likes l WHERE l.liker_id = $1
    )

    AND (u.sexual_preference = 'both' OR u.sexual_preference = $2)
    AND ($3 = 'both' OR u.gender::text = $3)

    GROUP BY u.id
    `;
    const suggestions = await pool.query(getSuggestionsQuery, [userId, me.gender, me.sexual_preference])
    const candidatesDistance = suggestions.rows.map(candidate => {
    const distance = (me.latitude && me.longitude && candidate.latitude && candidate.longitude)
        ? haversineDistance(me.latitude, me.longitude, candidate.latitude, candidate.longitude)
        : null;
        return { ...candidate, distance };
    });
    const maxTags = Math.max(...candidatesDistance.map(c => parseInt(c.common_tags)), 1);
    const maxDistance = Math.max(...candidatesDistance.map(c => c.distance ?? 0), 1);
    const maxFame = Math.max(...candidatesDistance.map(c => c.fame_rating), 1);

    const candidates = candidatesDistance.map(candidate => {
        const commonTags = parseInt(candidate.common_tags);
        const score = 
            (commonTags / maxTags * 0.5) +
            (candidate.distance !== null ? (1 - candidate.distance / maxDistance) * 0.3 : 0) +
            (candidate.fame_rating / maxFame * 0.2);
        return { ...candidate, score };
    });

    candidates.sort((a, b) => b.score - a.score)
    return { candidates }
}