import { Router } from "express";
import { registerUser, verifyEmail, loginUser, logoutUser } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;