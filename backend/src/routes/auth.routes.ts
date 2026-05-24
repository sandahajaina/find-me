import { Router } from "express";
import { registerUser, verifyEmail, loginUser, forgotPassword, logoutUser, resetPassword } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;