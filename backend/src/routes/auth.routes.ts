import { Router } from "express";
import { registerUser, verifyEmail, loginUser } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);

export default router;