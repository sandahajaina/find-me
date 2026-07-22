import { Router } from "express";
import { blockUser } from "../controllers/block.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router()

router.post('/:userId', authentifier, blockUser);

export default router