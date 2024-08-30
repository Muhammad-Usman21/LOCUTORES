import express from "express";
import {
	getInfo,
	storeInfo,
	updateInfo,
} from "../controllers/storage.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create-storage", verifyToken, storeInfo);
router.put("/update-storage", verifyToken, updateInfo);
router.get("/get-storage", getInfo);

export default router;
