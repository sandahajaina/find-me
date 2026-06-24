import { Router } from "express";
import { likeUser, unlikeUser } from "../controllers/like.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router();

router.post('/:userId', authentifier, likeUser);
router.delete('/:userId', authentifier, unlikeUser);

export default router;
