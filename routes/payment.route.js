import asyncWrapper from "../utils/asyncWrapper.js";
import {
  checkout,
  newPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/payment", verifyToken, asyncWrapper(newPayment));
router.post("/checkout", verifyToken, asyncWrapper(checkout));
router.post("/verify-payment", verifyToken, asyncWrapper(verifyPayment));

export default router;
