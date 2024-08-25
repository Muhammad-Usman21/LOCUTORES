import express from "express";
<<<<<<< HEAD
import {
	createSpeaker,
	getSpeaker,
	getSpeakers,
    updateSpeaker,
} from "../controllers/speaker.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
=======
import { getSpeaker, getSpeakers } from "../controllers/speaker.controller.js";
>>>>>>> 5d02e428926cbdf28b5e93dc2b22ca8b614fd956

const router = express.Router();

router.get("/getspeakers", getSpeakers);
router.post("/create-speaker/:userId", verifyToken, createSpeaker);
router.put("/update-speaker/:userId/:speakerId", verifyToken, updateSpeaker);
router.get("/getspeaker/:userId", getSpeaker);

export default router;
