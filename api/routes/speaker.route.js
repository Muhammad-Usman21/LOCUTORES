import express from "express";
import { getSpeaker, getSpeakers } from "../controllers/speaker.controller.js";

const router = express.Router();

router.get("/getspeakers", getSpeakers);

export default router;
