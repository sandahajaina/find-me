import { Router } from "express";
import { registerUser, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);

export default router;