import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      index: true,
      required: true,
    },
    SubCategoryName: { type: String, required: true },
    subCategoryImage: { type: String },
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model("subCategory", SubCategorySchema);
export default SubCategoryModel;
