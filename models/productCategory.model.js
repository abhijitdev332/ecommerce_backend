import mongoose from "mongoose";

const categorySchmea = new mongoose.Schema({
  categoryName: { type: String, required: true },
  categoryImage: { type: String },
});

const categoryModel = mongoose.model("category", categorySchmea);
export default categoryModel;
