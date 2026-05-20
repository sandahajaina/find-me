import { Router } from "express";
import { registerUser, verifyEmail, loginUser, logoutUser } from "../controllers/auth.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', authentifier, logoutUser);

export default router;