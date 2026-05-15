import { Router } from "express";
import { registerUser, verifyEmail,login } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);

export default router;