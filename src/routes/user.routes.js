import { Router } from "express";
import { logIn, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyjWT } from "../middleware/auth.middleware.js";
const router=Router();

router.route("/register").post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage' ,maxCount: 1}
    ]),
    registerUser)

    router.route("/login").post(logIn)

    // secured routes

    router.route("/logout").post(verifyjWT,logOutUser)
    router.route("/refreshtoken").post(refreshAccessToken)
export default router; 