import { Router } from "express";
import { getUser, updateMe, uploadPhoto, deletePhoto, setProfilePicture} from "../controllers/user.controller";
import { getUserTags, addUserTags, removeUserTag } from "../controllers/tag.controller";
import { authentifier } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get('/me', authentifier, getUser);
router.put('/me', authentifier, updateMe);
router.post('/me/photos', authentifier, upload.single('photo'), uploadPhoto);
router.delete('/me/photos/:photoId', authentifier, deletePhoto);
router.put('/me/photos/:photoId/profile', authentifier, setProfilePicture);
router.get('/me/tags', authentifier, getUserTags);
router.post('/me/tags', authentifier, addUserTags);
router.delete('/me/tags/:tagId', authentifier, removeUserTag);

export default router;
