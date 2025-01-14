import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "../controllers/product.controller.js";

router.post("/create", asyncWrapper(createProduct));
router.get("/:id", asyncWrapper(getProduct));
router.put("/update/:id", asyncWrapper(updateProduct));
router.put("/remove/:id", asyncWrapper(deleteProduct));

export default router;
