import { Router } from "express";
import { reportUser } from "../controllers/report.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router()

router.post('/:userId', authentifier, reportUser);

export default router