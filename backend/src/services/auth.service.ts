import pool from "../config/db";
import { RegisterBody } from "../types";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";
import crypto from "crypto";

export async function registerUser(user: RegisterBody) {
    const { username, email, last_name, first_name, password } = user;

    const emailCheckQuery = "SELECT id FROM users WHERE email = $1";
    const existingEmail = await pool.query(emailCheckQuery, [email.toLocaleLowerCase().trim()]);

    if (existingEmail.rows.length > 0) {
        throw new AppError("This email already exists", 409);
    }

    const usernameCheckQuery = "SELECT id FROM users WHERE username = $1";
    const existingUsername = await pool.query(usernameCheckQuery, [username.toLowerCase().trim()]);

    if (existingUsername.rows.length > 0) {
        throw new AppError("Username already exists", 409);
    }

    // hashing pwd
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const token = crypto.randomBytes(32).toString("hex");

    console.log("Inserer en BDD");
    console.log("Envoyer email");
}