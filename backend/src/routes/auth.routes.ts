import { Router } from "express";
import { registerUser, verifyEmail, loginUser, forgotPassword, logout, resetPassword } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/logout', logout);
router.post('/reset-password', resetPassword);

export default router;