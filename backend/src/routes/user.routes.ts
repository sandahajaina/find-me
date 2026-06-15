import { Router } from "express";
import { getUser, updateMe, uploadPhoto, deletePhoto} from "../controllers/user.controller";
import { authentifier } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get('/me', authentifier, getUser);
router.put('/me', authentifier, updateMe);
router.post('/me/photos', authentifier, upload.single('photo'), uploadPhoto);
router.delete('/me/photos/:photoId', authentifier, deletePhoto);

export default router;