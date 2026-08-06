import { Router } from "express";
import { searchUsers } from "../controllers/search.controller";
import { authentifier } from "../middlewares/auth.middleware";

const router = Router()

router.get('', authentifier, searchUsers);

export default router
