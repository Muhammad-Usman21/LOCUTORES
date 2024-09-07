import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
	createPost,
	deletePost,
	getPostsPublic,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/getposts-public", getPostsPublic);
router.post("/create-post", verifyToken, createPost);
router.delete("/delete-post/:postId/:userId", verifyToken, deletePost);

export default router;
