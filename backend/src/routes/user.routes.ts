import { Router } from "express";
import { getUser, updateMe} from "../controllers/user.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router();

router.get('/me', authentifier, getUser);
router.put('/me', authentifier, updateMe);

export default router;