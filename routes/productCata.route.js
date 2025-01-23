import express from "express";
import {
  createProductCata,
  deleteProductCata,
  getAllCategory,
  getProductCata,
  updateProductCata,
} from "../controllers/category.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { uploader } from "../middleware/uploadImage.js";
const router = express.Router();

router.post(
  "/create",
  uploader.single("image"),
  asyncWrapper(createProductCata)
);
router.get("/", asyncWrapper(getAllCategory));
router.get("/:id", asyncWrapper(getProductCata));
router.put("/update/:id", asyncWrapper(updateProductCata));
router.delete("/remove/:id", asyncWrapper(deleteProductCata));

export default router;
