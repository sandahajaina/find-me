import { Router } from "express";
import { getUser, updateMe, uploadPhoto, deletePhoto, setProfilePicture, getUserProfile, getSuggestion} from "../controllers/user.controller";
import { getUserTags, addUserTags, removeUserTag } from "../controllers/tag.controller";
import { getProfileViews, getProfileLikes, getProfileMatches } from "../controllers/history.controller";
import { authentifier } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get('/me', authentifier, getUser);
router.get('/suggestions', authentifier, getSuggestion);
router.get('/me/views', authentifier, getProfileViews);
router.get('/me/tags', authentifier, getUserTags);
router.get('/me/likes', authentifier, getProfileLikes);
router.get('/me/matches', authentifier, getProfileMatches);
router.get('/:userId', authentifier, getUserProfile);

router.put('/me', authentifier, updateMe);
router.put('/me/photos/:photoId/profile', authentifier, setProfilePicture);

router.post('/me/photos', authentifier, upload.single('photo'), uploadPhoto);
router.post('/me/tags', authentifier, addUserTags);

router.delete('/me/photos/:photoId', authentifier, deletePhoto);
router.delete('/me/tags/:tagId', authentifier, removeUserTag);


export default router;
