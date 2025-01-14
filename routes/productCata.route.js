import express from "express";
import {
  createProductCata,
  deleteProductCata,
  getProductCata,
  updateProductCata,
} from "../controllers/category.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
const router = express.Router();

router.post("/create", asyncWrapper(createProductCata));
router.get("/:id", asyncWrapper(getProductCata));
router.put("/update/:id", asyncWrapper(updateProductCata));
router.delete("/remove/:id", asyncWrapper(deleteProductCata));

export default router;
