import express from "express";
import {
	createSpeaker,
	getSpeaker,
	getSpeakerrr,
	getSpeakers,
	updateSpeaker,
} from "../controllers/speaker.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/getspeakers", getSpeakers);
router.post("/create-speaker/:userId", verifyToken, createSpeaker);
router.put("/update-speaker/:userId/:speakerId", verifyToken, updateSpeaker);
router.get("/getspeaker/:userId", getSpeaker);
router.get("/getspeakerrr/:slug", getSpeakerrr);

export default router;
