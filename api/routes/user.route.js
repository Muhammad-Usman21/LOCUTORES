import express from "express";
import {
	test,
	updateUser,
	deleteUser,
	getUsers,
	getUser,
	subscribe,
	subscribeCallback,
	makePremium,
	makeFree,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/getusers", verifyToken, getUsers);
router.get("/getuser/:userId", verifyToken, getUser);
router.get("/subscribe", verifyToken, subscribe);
router.get("/subscribe-callback", subscribeCallback);
router.put("/makePremium/:userId", verifyToken, makePremium);
router.put("/makeFree/:userId", verifyToken, makeFree);

export default router;
