import express from 'express'
import { getGoogleAuth, getGoogleToken } from '../controllers/google.controller';

const router = express.Router()

// guest route
router.get("/google/get-auth", getGoogleAuth);
router.post("/google/get-auth", getGoogleToken);

// **** otp **** 
// router.post("/otp/email", requestEmailOtpController);
// router.post("/otp/phone", requestPhoneOtpController);

// **** auth
// router.get("/register/:email/:username", validateEmailController)
// router.post("/register", registerController)
// router.post("/login", loginController)
// router.post("/change-password", changePasswordController)

// generic
// **** profile **** 
// router.post("/profile/update", authMiddleWare, updateProfileImageController) 
// router.get("/profile", authMiddleWare, getProfileController) 
// router.patch("/profile", authMiddleWare, updateProfileController) 



// auth route::old
// router.post("/group/create", authMiddleWare, createGroup)
// router.post("/group/invite-user", authMiddleWare, inviteGroup)
// router.get("/group/my-created-groups", authMiddleWare, myCreatedGroup)
// router.get("/group/invitation", authMiddleWare, viewInvitation)
// router.post("/group/invitation/alter", authMiddleWare, alterInvitation)

export default router;