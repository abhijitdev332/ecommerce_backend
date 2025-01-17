import express from "express";
import {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategory,
} from "../controllers/subCategory.controller.js";
import asyncWrapper from "../utils/asyncWrapper.js";
const router = express.Router();

router.post("/create", asyncWrapper(createCategory));
router.get("/", asyncWrapper(getAllSubCategory));
router.get("/:id", asyncWrapper(getCategory));
router.put("/update/:id", asyncWrapper(updateCategory));
router.delete("/remove/:id", asyncWrapper(deleteCategory));

export default router;
