import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const configEmail: SMTPTransport.Options = {
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
};

const transport = nodemailer.createTransport(configEmail);

export default transport;