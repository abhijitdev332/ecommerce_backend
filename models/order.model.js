import mongoose, { Schema } from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "variant",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number },
    transactionId: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: {
        values: ["card", "upi", "online banking", "applePay"],
        message: "{VALUE} is not a valid gateway",
      },
      default: "card",
    },
    status: {
      type: "string",
      enum: {
        values: ["pending", "shipped", "delivered"],
        message: "{VALUE} is not a status type",
      },
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
