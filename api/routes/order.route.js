import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { updateOrderStatus, createNewOrder, getOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/orders", verifyToken, getOrders);
router.post("/create-new-order", verifyToken, createNewOrder);
router.get("/status", verifyToken, updateOrderStatus);

export default router;
