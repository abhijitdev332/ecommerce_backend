import express from "express";
import {
  deleteVariant,
  createVariant,
  getVariant,
  updateVariant,
  createMany,
  imageUpload,
} from "../controllers/variant.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { uploader } from "../middleware/uploadImage.js";
const router = express.Router();

router.post("/create", uploader.array("images"), asyncWrapper(createVariant));
router.post(
  "/uploadImages",
  uploader.array("images", 5),
  asyncWrapper(imageUpload)
);
router.post("/insert", asyncWrapper(createMany));
router.get("/:id", asyncWrapper(getVariant));
router.put("/update/:id", asyncWrapper(updateVariant));
router.delete("/remove/:id", asyncWrapper(deleteVariant));

export default router;
