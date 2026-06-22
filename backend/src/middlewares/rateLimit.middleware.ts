import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, please try again later" }
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Too many attempts, please try again later" }
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many attempts, please try again later" }
});

export const verifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, please try again later" }
});
