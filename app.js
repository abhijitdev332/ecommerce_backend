import express from "express";
const app = express();
import { globalErrorHandler } from "./utils/globalErrorHandler.js";
import dotenv from "dotenv";
import cookie from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
// import
import {
  userRoutes,
  authRoutes,
  paymentRoutes,
  cartRoutes,
  orderRoutes,
  productCataRoutes,
  productRoutes,
  variantRoutes,
  subCategoryRoutes,
} from "./routes/routes.js";

import { allowOrigins } from "./config/config.js";
import { configureCloudinary } from "./config/cloudinay.js";
import { AppError } from "./lib/customError.js";
// env config
dotenv.config();
// cors config
app.use(
  cors({
    credentials: true,
    origin: [...allowOrigins],
  })
);
// express json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// express xss and csrf helmet
app.use(
  helmet({
    xPoweredBy: false,
  })
);
// cookie parser
app.use(cookie());
// cloudinary image storage
configureCloudinary();
app.get("/", (req, res) => {
  res.json("this is reponse from backend");
});
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product/variant", variantRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", productCataRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/payment", paymentRoutes);
// unversal error route
app.use("*", async (req, res, next) => {
  let noRouteErr = new AppError("No route match with this path", 400);
  next(noRouteErr);
});
// global error handler

app.use(globalErrorHandler);

export default app;
