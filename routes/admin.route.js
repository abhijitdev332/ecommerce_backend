import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  getAdminOrdersByCountry,
  getAdminOrderStatus,
  getAdminStats,
  getAllCategories,
  getAllOrders,
  getAllProduct,
  getAllUsers,
  getProductWithVariants,
  getTopCategories,
} from "../controllers/admin.controller.js";
const router = express.Router();

router.get("/products", asyncWrapper(getAllProduct));
router.get("/stats", asyncWrapper(getAdminStats));
router.get("/orderStats", asyncWrapper(getAdminOrderStatus));
router.get("/byCountry", asyncWrapper(getAdminOrdersByCountry));
router.get("/products/variant", asyncWrapper(getProductWithVariants));
router.get("/users", asyncWrapper(getAllUsers));
router.get("/categories", asyncWrapper(getAllCategories));
router.get("/categories/top", asyncWrapper(getTopCategories));
router.get("/orders", asyncWrapper(getAllOrders));

export default router;
