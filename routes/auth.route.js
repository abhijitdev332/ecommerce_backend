import express from "express";
const router = express.Router();

// IMPORT CONTROLLERS
import asyncWrapper from "../utils/asyncWrapper.js";
import { login, logout, refreshToken, verifySession } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
router.post("/verify-session",asyncWrapper(verifySession))
router.post("/login", asyncWrapper(login));
router.post("/refresh-token", asyncWrapper(refreshToken));
router.post("/logout", verifyToken, asyncWrapper(logout));

export default router;
