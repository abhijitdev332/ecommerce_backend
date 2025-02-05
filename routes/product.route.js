import express from "express";
const router = express.Router();
import asyncWrapper from "../utils/asyncWrapper.js";
import {
  addReview,
  createProduct,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getAllProductWithFillters,
  getProduct,
  getProductByGender,
  getProductOrderDetails,
  getProductsByCategory,
  getProductsBySubCategory,
  getRelatedProducts,
  getTopSellingProducts,
  newArrivalsProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminPermit } from "../middleware/adminPermit.js";
import { verifyToken } from "../middleware/verifyToken.js";

router.post("/create", adminPermit, asyncWrapper(createProduct));
router.get("/top", asyncWrapper(getTopSellingProducts));
router.get("/arival", asyncWrapper(newArrivalsProducts));
router.get("/shop", asyncWrapper(getAllProductWithFillters));
router.get("/relative/:id", asyncWrapper(getRelatedProducts));
router.get("/category", asyncWrapper(getProductsByCategory));
router.get("/subCategory", asyncWrapper(getProductsBySubCategory));
router.get("/orders", adminPermit, asyncWrapper(getProductOrderDetails));
router.get("/", asyncWrapper(getProductByGender));
router.get("/:id", asyncWrapper(getProduct));
router.post("/review/add/:id", verifyToken, asyncWrapper(addReview));
router.delete("/review/remove/:id", verifyToken, asyncWrapper(deleteReview));
router.put("/update/:id", adminPermit, asyncWrapper(updateProduct));
router.delete("/remove/:id", adminPermit, asyncWrapper(deleteProduct));

export default router;
