import express from "express";
import {
  deleteVariant,
  createVariant,
  getVariant,
  updateVariant,
} from "../controllers/variant.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
const router = express.Router();

router.post("/create", asyncWrapper(createVariant));
router.get("/:id", asyncWrapper(getVariant));
router.put("/update/:id", asyncWrapper(updateVariant));
router.delete("/remove/:id", asyncWrapper(deleteVariant));

export default router;
