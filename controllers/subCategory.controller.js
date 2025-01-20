import { subCategoryModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { successResponse } from "../utils/apiResponse.js";
async function createCategory(req, res, next) {
  const { categoryId, SubCategoryName, subCategoryImage = "" } = req.body;
  // const hadCata = await subCategoryModel.find({ categoryId });
  // if (hadCata.length > 0) {
  //   let userErr = new AppError("Category already in use!!", 400);
  //   return next(userErr);
  // }

  const newCata = new subCategoryModel({
    categoryId,
    SubCategoryName,
    subCategoryImage,
  });

  let savedCata = await newCata.save();
  if (!savedCata) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(res, 201, "Category Created Successfully", savedCata);
}
async function getAllSubCategory(req, res, next) {
  const subCategories = await subCategoryModel.find({});

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
  const { SubCategoryName, subCategoryImage = "" } = req.body;

  const updatedCata = await subCategoryModel.findByIdAndUpdate(
    id,
    { SubCategoryName, subCategoryImage },
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
