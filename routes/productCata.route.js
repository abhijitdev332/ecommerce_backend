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
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();

router.post(
  "/create",
  verifyToken,
  uploader.single("image"),
  asyncWrapper(createProductCata)
);

router.get("/", asyncWrapper(getAllCategory));
// router.get("/products/:id", asyncWrapper(getProductsOfCategory));
router.get("/:id", asyncWrapper(getProductCata));
router.put(
  "/update/:id",
  verifyToken,
  uploader.single("image"),
  asyncWrapper(updateProductCata)
);
router.delete("/remove/:id", verifyToken, asyncWrapper(deleteProductCata));

export default router;
