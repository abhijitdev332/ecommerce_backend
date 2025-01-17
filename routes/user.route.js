import express from "express";
const router = express.Router();

// imports
import asyncWrapper from "../utils/asyncWrapper.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { validateData } from "../middleware/schemaValidation.js";
import { userCreationSchema, userUpdateSchema } from "../schemas/userSchema.js";
import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "../controllers/user.controller.js";

router.post("/create", asyncWrapper(createUser));
router.get("/:id", asyncWrapper(getUser));
router.put(
  "/:id",
  verifyToken,
  validateData(userUpdateSchema),
  asyncWrapper(updateUser)
);
router.delete("/:id", verifyToken, asyncWrapper(deleteUser));

export default router;
