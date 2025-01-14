import mongoose, { Schema } from "mongoose";
const cartSchema = new mongoose.Schema(
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
    cartTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

const cartModel = mongoose.model("cart", cartSchema);
export default cartModel;
