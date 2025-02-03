import mongoose, { Schema } from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    products: {
      type: [
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
          name: String,
          price: Number,
          imgurl: String,
          color: String,
          size: String,
        },
      ],
      default: [],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    cartTotal: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const cartModel = mongoose.model("cart", cartSchema);
export default cartModel;
