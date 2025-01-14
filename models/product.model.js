import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  rating: { type: Number, max: 5, default: 0 },
  comment: { type: String, required: true },
});
const productDetailsSchema = new Schema({
  packOf: {
    type: Number,
    default: 1,
  },
  styleCode: {
    type: String,
  },
  fabric: {
    type: String,
  },
  fabricCare: String,
  pattern: { type: String },
  pockets: Number,
  sleeve: String,
  SuitableFor: String,
  fit: String,
  style: {
    type: [String],
    enum: {
      values: ["casual", "formal", "party", "gym"],
      message: "{VALUE} is not a valid style",
    },
  },
});
const variantSchema = new Schema({
  variantName: String,
  variantValues: Array,
  variantPrice: Number,
  variantStock: Number,
  variantImages: [],
});
// Product Schema
const ProductSchema = new Schema(
  {
    genderFor: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [5000, "Product description cannot exceed 5000 characters"],
    },
    category: {
      type: [Schema.Types.ObjectId],
      ref: "category",
      required: [true, "Product category is required"],
    },
    productDetails: productDetailsSchema,
    brand: { type: String, trim: true },
    reviews: [ReviewSchema],
    numReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    isFeatured: { type: Boolean, default: false },
    returnPolicy: {
      type: Number,
      default: 10,
    },
    deliveryFees: {
      type: Number,
      default: 0,
    },
    bankOffers: {
      type: Array,
    },
    variations: [variantSchema],
  },
  { timestamps: true }
);

const productModel = mongoose.model("product", ProductSchema);
export default productModel;
