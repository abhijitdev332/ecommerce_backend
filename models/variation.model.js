import mongoose, { Schema } from "mongoose";
const variantValueSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  variantionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "variant",
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    minLength: [8, "Sku Number should have 8 charcters long"],
  },
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
});
const VariantSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
      index: true,
    },
    variantionName: { type: String },
  },
  { timestamps: true }
);

const variationModel = mongoose.model("variant", VariantSchema);
const variationValueModel = mongoose.model("variantValue", variantValueSchema);

export { variationModel, variationValueModel };
