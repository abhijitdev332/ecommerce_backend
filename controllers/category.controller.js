import { productCate } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { successResponse } from "../utils/apiResponse.js";
async function createProductCata(req, res, next) {
  const { categoryName, categoryImage = "" } = req.body;
  const hadCata = await productCate.find({ categoryName: categoryName });
  if (hadCata.length > 0) {
    let userErr = new AppError("Category already in use!!", 400);
    return next(userErr);
  }

  const newCata = new productCate({
    categoryName,
    categoryImage,
  });

  let savedCata = await newCata.save();
  if (!savedCata) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
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
