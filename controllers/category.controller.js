import { productCate, productModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadSingleToCloudinary } from "../middleware/uploadImage.js";

async function createProductCata(req, res, next) {
  const { name } = req.body;
  let cateName = JSON.parse(name);
  const hadCata = await productCate.find({ categoryName: cateName });
  if (hadCata.length > 0) {
    let cateErr = new AppError("Category already in use!!", 400);
    return next(cateErr);
  }
  const fileBuffer = req.file.buffer; // File buffer from Multer
  const folder = "category"; // Cloudinary folder name

  // Upload image to Cloudinary
  const categoryImageUrl = await uploadSingleToCloudinary(fileBuffer, folder);
  const newCata = new productCate({
    categoryName: cateName,
    categoryImage: categoryImageUrl?.url,
  });

  let savedCata = await newCata.save();
  if (!savedCata) {
    let cateErr = new DatabaseError("Failed to create user!!");
    return next(cateErr);
  }

  return successResponse(res, 201, "Category Created Successfully", savedCata);
}
async function getAllCategory(req, res, next) {
  const categories = await productCate.find({});
  if (!categories) {
    return next(new ServerError("failed to get categories", 500));
  }
  return successResponse(res, 200, "Successfull", categories);
}
async function getProductCata(req, res, next) {
  const { id } = req.params;

  const matchedCata = await productCate.findOne({ _id: id });
  if (!matchedCata) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }
  return successResponse(res, 200, "successfull", matchedCata);
}
async function updateProductCata(req, res, next) {
  const { id } = req.params;
  const { categoryName, categoryImage = "" } = req.body;

  const updatedCata = await productCate.findByIdAndUpdate(
    id,
    { categoryName, categoryImage },
    {
      runValidators: true,
    }
  );
  if (!updatedCata) {
    let serverErr = new DatabaseError("Failed to update Category!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "category update successfull", updatedCata);
}
async function deleteProductCata(req, res, next) {
  const { id } = req.params;
  const productDel = await productModel.deleteMany({ category: id });
  if (!productDel) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  const deletedCata = await productCate.findByIdAndDelete(id);
  if (!deletedCata) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "category deleted successfull");
}

export {
  createProductCata,
  getProductCata,
  updateProductCata,
  deleteProductCata,
  getAllCategory,
};
