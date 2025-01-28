import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  rating: { type: Number, max: 5, default: 0 },
  comment: { type: String, required: true },
});
const productDetailsSchema = new Schema({
  packOf: {
    type: String,
    default: "1",
  },
  styleCode: {
    type: String,
  },
  fabric: {
    type: String,
  },
  fabricCare: String,
  pattern: { type: String },
  pockets: String,
  sleeve: String,
  SuitableFor: String,
  fit: String,
  style: {
    type: String,
    enum: {
      values: ["casual", "formal", "party", "gym"],
      message: "{VALUE} is not a valid style",
    },
  },
});

// Product Schema
const ProductSchema = new Schema(
  {
    genderFor: {
      type: String,
      enum: {
        values: ["male", "female", "kids"],
        message: `{VALUE} is not defined gender`,
      },
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      maxLength: [6, "maximum 6 charters allowed"],
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
    imgurl: {
      type: String,
    },
    category: {
      type: [Schema.Types.ObjectId],
      ref: "category",
      required: [true, "Product category is required"],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
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
  },
  { timestamps: true }
);
ProductSchema.statics.calculateReviewStats = async function (productId) {
  const result = await this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(productId) } },
    { $unwind: "$reviews" }, // Decompose the reviews array
    {
      $group: {
        _id: "$_id",
        totalReviews: { $sum: 1 }, // Count the number of reviews
        averageRating: { $avg: "$reviews.rating" }, // Calculate the average rating
      },
    },
  ]);

  if (result.length > 0) {
    const { totalReviews, averageRating } = result[0];
    // Update the product document with the calculated values
    await this.findByIdAndUpdate(productId, {
      numReviews: totalReviews,
      averageRating: averageRating.toFixed(2), // Round to 2 decimal places
    });
  } else {
    // Reset if no reviews are present
    await this.findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 0,
    });
  }
};

const productModel = mongoose.model("product", ProductSchema);
export default productModel;
