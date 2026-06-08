import { Router } from "express";
import { getUser, updateMe, uploadPhoto} from "../controllers/user.controller";
import { authentifier } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get('/me', authentifier, getUser);
router.put('/me', authentifier, updateMe);
router.post('/me/photos', authentifier, upload.single('photo'), uploadPhoto);

export default router;