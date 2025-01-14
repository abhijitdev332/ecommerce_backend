import mongoose, { Schema } from "mongoose";
const VariantSchema = new mongoose.Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
    color: { type: String },
    size: { type: String },
    basePrice: { type: Number },
    sellPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    discount: {
      type: Number,
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
