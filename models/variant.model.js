import mongoose, { Schema } from "mongoose";
const VariantSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    color: { type: String, required: true, index: true },
    size: { type: String, required: true },
    basePrice: { type: Number, default: 0 },
    sellPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sold: {
      type: Number,
      default: 0, // Track the number of items sold for this specific variant
    },
    discount: {
      type: String,
      default: "0",
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const productVariantModel = mongoose.model("variant", VariantSchema);

export default productVariantModel;
