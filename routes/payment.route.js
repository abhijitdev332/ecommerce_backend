import asyncWrapper from "../utils/asyncWrapper.js";
import {
  checkout,
  newPayment,
  verifyPayment,
} from "../controllers/payment.controller.js";
import express from "express";
const router = express.Router();

router.post("/payment", asyncWrapper(newPayment));
router.post("/checkout", asyncWrapper(checkout));
router.post("/verify-payment", asyncWrapper(verifyPayment));

export default router;
