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
import { adminPermit } from "../middleware/adminPermit.js";
const router = express.Router();

router.get("/products", adminPermit, asyncWrapper(getAllProduct));
router.get("/stats", adminPermit, asyncWrapper(getAdminStats));
router.get("/orderStats", adminPermit, asyncWrapper(getAdminOrderStatus));
router.get("/byCountry", adminPermit, asyncWrapper(getAdminOrdersByCountry));
router.get(
  "/products/variant",
  adminPermit,
  asyncWrapper(getProductWithVariants)
);
router.get("/users", adminPermit, asyncWrapper(getAllUsers));
router.get("/categories", adminPermit, asyncWrapper(getAllCategories));
router.get("/categories/top", adminPermit, asyncWrapper(getTopCategories));
router.get("/orders", adminPermit, asyncWrapper(getAllOrders));

export default router;
