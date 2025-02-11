import { orderModel, variantModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { infoResponse, successResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
async function createOrder(req, res, next) {
  const { userId, products, totalAmount, discount, transactionId, address } =
    req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create a new order instance
    const newOrder = new orderModel({
      userId,
      totalAmount,
      discount,
      address,
      transactionId,
      products,
    });

    // Iterate over each product in the order to update the stock
    for (const product of products) {
      const { productId, variantId, quantity } = product;

      // Find the variant and reduce the stock
      const variant = await variantModel.findOneAndUpdate(
        { _id: variantId, productId: productId },
        { $inc: { stock: -quantity, sold: quantity } }, // Reduce stock by the quantity ordered

        { new: true, session } // Use session for transaction
      );

      if (!variant) {
        throw new Error(
          `Variant with ID ${variantId} not found or insufficient stock.`
        );
      }

      // Optional: Check if stock goes negative (you can add validation here)
      if (variant.stock < 0) {
        throw new Error(`Insufficient stock for variant ID ${variantId}.`);
      }
    }

    // Save the order
    const savedOrder = await newOrder.save({ session });
    if (!savedOrder) {
      throw new DatabaseError("Failed to create order!");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with the saved order
    return successResponse(res, 201, "Order Successfully Created", savedOrder);
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    session.endSession();

    // Pass the error to the error handling middleware
    return next(error);
  }
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
async function getUserOrders(req, res, next) {
  const { id } = req.params;
  const { limit = 0, skip = 0 } = req.query;
  let products = await orderModel
    .find({ userId: id })
    .sort({ createdAt: -1 })
    .skip(+skip)
    .limit(+limit)
    .populate("products.productId")
    .populate("products.variantId");

  if (!products) {
    return successResponse(res, 400, "failed to get orders");
  }

  return successResponse(res, 200, "successfull", products);
}
async function updateOrder(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;

  const updatedOrder = await orderModel.findByIdAndUpdate(
    id,
    { status: status },
    {
      runValidators: true,
    }
  );
  if (!updatedOrder) {
    let serverErr = new DatabaseError("Failed to update order status!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "Order status updated successfully");
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

export { createOrder, getOrder, updateOrder, deleteOrder, getUserOrders };
