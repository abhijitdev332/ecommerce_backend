import mongoose from "mongoose";

const categorySchmea = new mongoose.Schema(
  {
    categoryName: { type: String, required: true },
    categoryImage: { type: String },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("category", categorySchmea);
export default categoryModel;
