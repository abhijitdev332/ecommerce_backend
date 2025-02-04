import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  addProductInCart,
  createCart,
  deleteCart,
  getCart,
  removeProductInCart,
  updateCart,
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.post("/create", verifyToken, asyncWrapper(createCart));
router.get("/:id", verifyToken, asyncWrapper(getCart));
router.post("/product/add/:id", verifyToken, asyncWrapper(addProductInCart));
router.post(
  "/product/remove/:id",
  verifyToken,
  asyncWrapper(removeProductInCart)
);
router.put("/update/:id", verifyToken, asyncWrapper(updateCart));
router.delete("/remove/:id", verifyToken, asyncWrapper(deleteCart));
export default router;
