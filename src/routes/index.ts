import express from 'express'
import { loginController, registerController, requestPhoneOtpController, requestEmailOtpController, changePasswordController, validateEmailController } from '../controllers/auth.controller';
import { alterInvitation, createGroup, inviteGroup, myCreatedGroup, viewInvitation } from '../controllers/group.controller';
import { getProfileController, updateProfileController, updateProfileImageController } from '../controllers/profile.controller';
import { authAdminMiddleWare, authMiddleWare } from '../middleware/auth.middleware';

const router = express.Router()

// guest route

// **** otp **** 
router.post("/otp/email", requestEmailOtpController);
router.post("/otp/phone", requestPhoneOtpController);

// **** auth
router.get("/register/:email/:username", validateEmailController)
router.post("/register", registerController)
router.post("/login", loginController)
router.post("/change-password", changePasswordController)

// generic
// **** profile **** 
router.post("/profile/update", authMiddleWare, updateProfileImageController) 
router.get("/profile", authMiddleWare, getProfileController) 
router.patch("/profile", authMiddleWare, updateProfileController) 



// auth route::old
router.post("/group/create", authMiddleWare, createGroup)
router.post("/group/invite-user", authMiddleWare, inviteGroup)
router.get("/group/my-created-groups", authMiddleWare, myCreatedGroup)
router.get("/group/invitation", authMiddleWare, viewInvitation)
router.post("/group/invitation/alter", authMiddleWare, alterInvitation)

export default router;