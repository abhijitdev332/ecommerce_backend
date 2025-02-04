import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  createOrder,
  deleteOrder,
  getOrder,
  getUserOrders,
  updateOrder,
} from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.post("/new", verifyToken, asyncWrapper(createOrder));
router.get("/user/:id", verifyToken, asyncWrapper(getUserOrders));
router.get("/:id", verifyToken, asyncWrapper(getOrder));
router.put("/update/:id", verifyToken, asyncWrapper(updateOrder));
router.delete("/remove/:id", verifyToken, asyncWrapper(deleteOrder));

export default router;
