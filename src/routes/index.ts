import express, { Request, Response } from 'express'
import { chatCompletion } from '../controllers/ai.controller';

const router = express.Router()

// guest route
router.get("/chat-completion", chatCompletion);

export default router;