import asyncWrapper from "../utils/asyncWrapper.js";
import { checkout, newPayment } from "../controllers/payment.controller.js";
import express from "express";
const router = express.Router();

router.post("/payment", asyncWrapper(newPayment));
router.post("/checkout", asyncWrapper(checkout));

export default router;
