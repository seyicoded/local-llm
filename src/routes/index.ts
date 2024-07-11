import express, { Request, Response } from 'express'
import { createMeetingSpace, getGoogleAuth, getGoogleCalendar, getGoogleMails, getGoogleMailsSummary, getGoogleToken, getMeetingConference, getMeetingConferenceParticipant, getMeetingConferenceTranscript, getMeetingSpace, getSummarydata } from '../controllers/google.controller';
import { LZ77 } from '../helper/lz77.encoder';
import { huffmanCompress } from '../helper/huffman.encoder';
import { burrowsWheelerTransform, runLengthDecode, runLengthEncode } from '../helper/burrow-wheeler.encoder';
import { LZW } from '../helper/lzw.encoder';

const router = express.Router()

// guest route
router.get("/google/get-auth", getGoogleAuth);
router.post("/google/get-auth", getGoogleToken);

// calendar
router.get("/google/get-calendar", getGoogleCalendar);
// gmail
router.get("/google/get-mails", getGoogleMails);
router.get("/google/get-mails-summary", getGoogleMailsSummary);

// gmeet
router.post("/google/create-meeting-space", createMeetingSpace);
router.get("/google/get-meeting-space", getMeetingSpace);
router.get("/google/get-meeting-conference", getMeetingConference);
router.get("/google/get-participant-conference", getMeetingConferenceParticipant);
router.get("/google/get-conference-transcript", getMeetingConferenceTranscript);


router.get("/summary-fetcher", getSummarydata);

router.get("/google/testcode", (req: Request, res: Response)=>{
    const text = req.query?.text;
    // let r = LZ77.compress(text);
    // console.log(r);
    
    // const { huffmanTree, codeMap, compressed: r } = huffmanCompress(text);
    // console.log(r);
    
    // const { transformed, index } = burrowsWheelerTransform(text);
    
    // // const r = runLengthEncode(transformed);
    // const r = runLengthEncode(text);
    // const d = runLengthDecode(r);
    // console.log('Run-Length Encoded String:', r);
    
    let r = LZW.compress(text);
    let d = LZW.decompress(r);
    console.log(r, d);
    // console.log(r);

    res.send({
        original: text,
        encoded: r,
        decoded: d
    });
});

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