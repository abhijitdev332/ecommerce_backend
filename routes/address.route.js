import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  createAddress,
  deleteAddress,
  getAddress,
  getUsersAddress,
  updateAddress,
} from "../controllers/address.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post("/create", verifyToken, asyncWrapper(createAddress));
router.get("/user/:userId", verifyToken, asyncWrapper(getUsersAddress));
router.get("/:id", verifyToken, asyncWrapper(getAddress));
router.put("/:id", verifyToken, asyncWrapper(updateAddress));
router.delete("/:id", verifyToken, asyncWrapper(deleteAddress));

export default router;
