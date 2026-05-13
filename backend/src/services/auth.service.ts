import pool from "../config/db";
import { RegisterBody } from "../types";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function registerUser(user: RegisterBody) {
    const { username, email, last_name, first_name, password } = user;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const emailCheckQuery = "SELECT id FROM users WHERE email = $1";
    const existingEmail = await pool.query(emailCheckQuery, [normalizedEmail]);

    if (existingEmail.rows.length > 0) {
        throw new AppError("This email already exists", 409);
    }

    const usernameCheckQuery = "SELECT id FROM users WHERE username = $1";
    const existingUsername = await pool.query(usernameCheckQuery, [normalizedUsername]);

    if (existingUsername.rows.length > 0) {
        throw new AppError("Username already exists", 409);
    }

    // hashing pwd
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const emailToken = crypto.randomBytes(32).toString("hex");

    // Define the expire date of the token
    const email_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // console.log("Inserer en BDD");
    const insertUserQuery = `
        INSERT INTO users(
            username, email, last_name, first_name, password, email_token, email_token_expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `;
    const registeredUser = await pool.query(insertUserQuery, [
        normalizedUsername,
        normalizedEmail, 
        last_name, 
        first_name, 
        hashedPassword,
        emailToken, 
        email_token_expires_at
    ]);

    console.log("Envoyer email");
    // Ajoute à la fin
    return { id: registeredUser.rows[0].id };
}