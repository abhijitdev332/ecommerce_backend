import express from "express";
import {
  deleteVariant,
  createVariant,
  getVariant,
  updateVariant,
  createMany,
  imageUpload,
  getProductsByColor,
  updateMany,
} from "../controllers/variant.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { uploader } from "../middleware/uploadImage.js";
import { adminPermit } from "../middleware/adminPermit.js";
const router = express.Router();

router.post("/create", uploader.array("images"), asyncWrapper(createVariant));
router.post(
  "/uploadImages",
  uploader.array("images", 5),
  asyncWrapper(imageUpload)
);
router.post("/insert", adminPermit, asyncWrapper(createMany));
router.get("/q", asyncWrapper(getProductsByColor));
router.get("/:id", asyncWrapper(getVariant));
router.put("/update/many", asyncWrapper(updateMany));
router.put("/update/:id", adminPermit, asyncWrapper(updateVariant));
router.delete("/remove/:id", adminPermit, asyncWrapper(deleteVariant));

export default router;
