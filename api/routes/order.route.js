import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { updateOrderStatus, createNewOrder, getOrders, getOrderNotification, updateOrderPaymentStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/orders", verifyToken, getOrders);
router.post("/create-new-order", verifyToken, createNewOrder);
router.post("/status", verifyToken, updateOrderStatus);
// router.get("/status", verifyToken, updateOrderPaymentStatus);
router.get("/orders-notifications", verifyToken, getOrderNotification);

export default router;
