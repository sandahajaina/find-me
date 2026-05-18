import pool from "../config/db";
import { LoginBody, RegisterBody } from "../types";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import crypto from "crypto";
import transporter from "../config/mailer";
import * as utils from "../utils/auth.utils";

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
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const emailToken = crypto.randomBytes(32).toString("hex");

    // Define the expire date of the token
    const email_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // console.log("Inserer en BDD");
    const insertUserQuery = `
        INSERT INTO users(
            username, email, last_name, first_name, password_hash, email_token, email_token_expires_at
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

    // console.log("Envoyer email");

    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify?token=${emailToken}`;

    await transporter.sendMail({
        from: '"Matcha" <noreply@matcha.com>',
        to: normalizedEmail,
        subject: "Verify your account",
        html: `<h1>Welcome ${username}!</h1>
            <a href=${verificationLink}>Verify my account</a>`
    });

    return { id: registeredUser.rows[0].id };
}

export async function verifyEmail(token:string) {
    const verifyTokenQuery = `
        SELECT id, email_token_expires_at
        FROM users
        WHERE email_token = $1 AND is_verified = false
    `;
    const verifiedUser = await pool.query(verifyTokenQuery, [token]);
    if (verifiedUser.rows.length === 0) {
        throw new AppError("Bad token", 400);
    }
    const user = verifiedUser.rows[0];
    const expiresAt = new Date(user.email_token_expires_at);

    if (Date.now() > expiresAt.getTime()) {
        throw new AppError("Token expired", 400);
    }

    const updateUserDataQuery = `
        UPDATE users
        SET is_verified = true,
        email_token = null,
        email_token_expires_at = null
        WHERE id = $1
    `;

    await pool.query(updateUserDataQuery, [user.id]);
    return {id : user.id};
}

export async function loginUser(params: LoginBody) {
    const {username, password} = params;
    const checkUserQuery = `
        SELECT id, password_hash, is_verified 
        FROM users 
        WHERE username = $1
    `;
    const result = await pool.query(checkUserQuery, [username]);
    if (result.rows.length === 0) {
        throw new AppError("Invalid credentials", 400);
    }
    const user = result.rows[0];
    if (!user.is_verified) {
        throw new AppError("Please verify your account", 400);
    }
    const hashedPassword = user.password_hash;
    const match =  await bcrypt.compare(password, hashedPassword);

    if (!match) {
        throw new AppError("Invalid credentials", 400);
    }

    const tokenJwt = utils.genererToken({
        id: user.id, 
        username,
        is_verified: user.is_verified,
    }, "7d");

    const updateUserDataQuery = `
        UPDATE users
        SET is_online = true,
        last_seen_at = NOW()
        WHERE id = $1
    `;
    await pool.query(updateUserDataQuery, [user.id]);

    return {id: user.id, username, tokenJwt};
}