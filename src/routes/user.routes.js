import {Router} from 'express';
import { registerUser } from '../controllers/user.controller.js';

import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

import {refreshAccessToken, loginUser, logoutUser} from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);


router.route("/login").post(loginUser);


//secured route, only for authenticated users
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;