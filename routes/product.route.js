import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  addReview,
  createProduct,
  deleteProduct,
  deleteReview,
  getProduct,
  updateProduct,
} from "../controllers/product.controller.js";

router.post("/create", asyncWrapper(createProduct));
router.get("/:id", asyncWrapper(getProduct));
router.post("/review/add/:id",asyncWrapper(addReview))
router.delete("/review/remove/:id",asyncWrapper(deleteReview))
router.put("/update/:id", asyncWrapper(updateProduct));
router.delete("/remove/:id", asyncWrapper(deleteProduct));

export default router;
