import { orderModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { infoResponse, successResponse } from "../utils/apiResponse.js";
async function createOrder(req, res, next) {
  const {
    userId,
    products,
    totalAmount,
    discount,
    transactionId,
    paymentGateway,
  } = req.body;

  const newOrder = new orderModel({ ...req.body });
  let savedOrder = await newOrder.save();
  if (!savedOrder) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(res, 201, "Variant Created Successfully", savedOrder);
}
async function getOrder(req, res, next) {
  const { id } = req.params;

  const matchedOrder = await orderModel
    .findById(id)
    .populate("products.productId", { name: 1, sku: 1 })
    .populate("products.variantId")
    .populate("userId")
    .populate("address");

  if (!matchedOrder) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }

  return successResponse(res, 200, "sucessfull", matchedOrder);
}
async function updateOrder(req, res, next) {
  const { id } = req.params;
  const { products, totalAmount, discount, transactionId, paymentGateway } =
    req.body;

  const updatedOrder = await variantModel.findByIdAndUpdate(
    id,
    { ...req.body },
    {
      runValidators: true,
    }
  );
  if (!updatedOrder) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "Product Variant updated successfully");
}
async function deleteOrder(req, res, next) {
  const { id } = req.params;
  const deletedOrder = await variantModel.findByIdAndDelete(id);
  if (!deletedOrder) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "product variant Deleted");
}

export { createOrder, getOrder, updateOrder, deleteOrder };
