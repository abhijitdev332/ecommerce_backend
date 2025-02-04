import express from "express";
import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategory,
} from "../controllers/subCategory.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { uploader } from "../middleware/uploadImage.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post(
  "/create",
  verifyToken,
  uploader.single("image"),
  asyncWrapper(createCategory)
);
router.get("/", asyncWrapper(getAllSubCategory));
router.get("/:id", asyncWrapper(getCategory));
router.put(
  "/update/:id",
  verifyToken,
  uploader.single("image"),
  asyncWrapper(updateCategory)
);
router.delete("/remove/:id", verifyToken, asyncWrapper(deleteCategory));

export default router;
