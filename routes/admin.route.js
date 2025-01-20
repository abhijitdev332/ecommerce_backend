import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  getAllProduct,
  getAllUsers,
  getProductWithVariants,
} from "../controllers/admin.controller.js";
const router = express.Router();

router.get("/products", asyncWrapper(getAllProduct));
router.get("/products/variant", asyncWrapper(getProductWithVariants));
router.get("/users", asyncWrapper(getAllUsers));

export default router;
