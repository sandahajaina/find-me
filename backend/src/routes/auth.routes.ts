import { Router } from "express";
import { registerUser, verifyEmail, loginUser, forgotPassword, logoutUser, resetPassword } from "../controllers/auth.controller";
import { authentifier } from "../middlewares/auth.middleware";
import { loginLimiter, registerLimiter, forgotPasswordLimiter, verifyLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.post('/register', registerLimiter, registerUser);
router.get('/verify/:token', verifyLimiter, verifyEmail);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', authentifier, logoutUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
