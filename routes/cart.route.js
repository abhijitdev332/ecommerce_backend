import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  addProductInCart,
  createCart,
  deleteCart,
  getCart,
  updateCart,
} from "../controllers/cart.controller.js";

router.post("/create", asyncWrapper(createCart));
router.get("/:id", asyncWrapper(getCart));
router.post("/product/add/:id", asyncWrapper(addProductInCart));
router.post("/product/remove/:id", asyncWrapper(addProductInCart));
router.put("/update/:id", asyncWrapper(updateCart));
router.delete("/remove/:id", asyncWrapper(deleteCart));
export default router;
