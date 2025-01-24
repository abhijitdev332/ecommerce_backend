import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  createAddress,
  deleteAddress,
  getAddress,
  getUsersAddress,
  updateAddress,
} from "../controllers/address.controller.js";
const router = express.Router();

router.post("/create", asyncWrapper(createAddress));
router.get("/user/:userId", asyncWrapper(getUsersAddress));
router.get("/:id", asyncWrapper(getAddress));
router.put("/:id", asyncWrapper(updateAddress));
router.delete("/:id", asyncWrapper(deleteAddress));

export default router;
