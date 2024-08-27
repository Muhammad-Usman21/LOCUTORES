import express from "express";
import {
	signup,
	signin,
	signout,
	signinWithStripe,
	stripeCallback,
  google,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/signin-stripe", verifyToken, signinWithStripe);
router.get("/stripe-callback", stripeCallback);
router.post("/google", google);

export default router;
