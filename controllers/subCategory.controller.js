import { productModel, subCategoryModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadSingleToCloudinary } from "../middleware/uploadImage.js";
async function createCategory(req, res, next) {
  const { name, categoryId } = req.body;
  let cateName = JSON.parse(name);
  let cateId = JSON.parse(categoryId);
  const hadCata = await subCategoryModel.find({
    $and: [{ SubCategoryName: cateName }, { categoryId: cateId }],
  });
  if (hadCata.length > 0) {
    let cateErr = new AppError("Sub Category already in use!!", 400);
    return next(cateErr);
  }
  const fileBuffer = req.file.buffer; // File buffer from Multer
  const folder = "subcategory"; // Cloudinary folder name

  // Upload image to Cloudinary
  const categoryImageUrl = await uploadSingleToCloudinary(fileBuffer, folder);
  const newCata = new subCategoryModel({
    categoryId: cateId,
    SubCategoryName: cateName,
    subCategoryImage: categoryImageUrl?.url,
  });

  let savedCata = await newCata.save();
  if (!savedCata) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(res, 201, "Category Created Successfully", savedCata);
}
async function getAllSubCategory(req, res, next) {
  const { limit = 5, skip = 0 } = req.query;
  const subCategories = await subCategoryModel
    .find({})
    .sort({ createdAt: -1 })
    .skip(+skip)
    .limit(+limit);

  if (!subCategories) {
    return next(new ServerError("Failed to get all Suv categories", 500));
  }
  return successResponse(res, 200, "successfull", subCategories);
}
async function getCategory(req, res, next) {
  const { id } = req.params;

  const matchedCata = await subCategoryModel.findOne({ _id: id });
  if (!matchedCata) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }
  return successResponse(res, 200, "successfull", matchedCata);
}
async function updateCategory(req, res, next) {
  const { id } = req.params;
  const { name } = req.body;

  const fileBuffer = req?.file?.buffer; // File buffer from Multer
  const folder = "subcategory"; // Cloudinary folder name
  let categoryImage;
  if (fileBuffer) {
    categoryImage = await uploadSingleToCloudinary(fileBuffer, folder);
    const updatedCata = await subCategoryModel.findByIdAndUpdate(
      id,
      { SubCategoryName: name, subCategoryImage: categoryImage?.url },
      {
        runValidators: true,
      }
    );
    return successResponse(
      res,
      200,
      "category update successfull",
      updatedCata
    );
  }

  const updatedCata = await subCategoryModel.findByIdAndUpdate(
    id,
    { SubCategoryName: name },
    {
      runValidators: true,
    }
  );
  if (!updatedCata) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "category update successfull", updatedCata);
}
async function deleteCategory(req, res, next) {
  const { id } = req.params;
  const productDel = await productModel.deleteMany({ subCategory: id });
  if (!productDel) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  const deletedCata = await subCategoryModel.findByIdAndDelete(id);
  if (!deletedCata) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "category deleted successfull");
}

export {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllSubCategory,
};
