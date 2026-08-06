import pool from "../config/db";
import { AppError } from "../utils/AppError";

export async function reportUser(reporterId: number, reportedUserId: number, reason?: string){
    if (reporterId === reportedUserId) {
        throw new AppError("You cannot report yourself", 400);
    }
    const checkUser = `
        SELECT * FROM users WHERE id = $1
    `;
    const result = await pool.query(checkUser, [reportedUserId])
    if (result.rows.length === 0) {
        throw new AppError("User id not found", 404);
    }

    const checkBlock = `
        SELECT id FROM blocks 
        WHERE (blocker_id = $1 AND blocked_user_id = $2)
        OR (blocker_id = $2 AND blocked_user_id = $1)
    `;
    const blockResult = await pool.query(checkBlock, [reporterId, reportedUserId]);
    if (blockResult.rows.length > 0) {
        throw new AppError("You cannot report a blocked user", 403);
    }

    const addReportQuery = `
        INSERT INTO reports (reporter_id, reported_user_id, reason) VALUES ($1, $2, $3)
    `;
    await pool.query(addReportQuery, [reporterId, reportedUserId, reason])
    return { reported: true };
}