import { productModel, variantModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { successResponse } from "../utils/apiResponse.js";
import productModal from "../models/product.model.js";
async function createProduct(req, res, next) {
  const { username, email, phoneNumber, password } = req.body;
  // const haveUser = await productModel.find({
  //   $or: [{ email: email }, { phoneNumber: phoneNumber }],
  // });
  // if (haveUser.length > 0) {
  //   let userErr = new AppError("User already in use!!", 400);
  //   return next(userErr);
  // }
  const newProduct = new productModal({ ...req.body });
  let savedProduct = await newProduct.save();
  if (!savedProduct) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(
    res,
    201,
    "Product Created Successfully",
    savedProduct
  );
}
async function getProduct(req, res, next) {
  const { id } = req.params;

  const matchedProduct = await productModel.findOne({ _id: id });
  const productVariants = await variantModel.find({
    productId: matchedProduct?._id,
  });

  if (!matchedProduct) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }

  return successResponse(res, 200, "sucessfull", {
    matchedProduct,
    productVariants,
  });
}
async function updateProduct(req, res, next) {
  const { id } = req.params;
  const { username, email, password } = req.body;

  const updatedUser = await productModel.findByIdAndUpdate(
    id,
    { ...req.body },
    {
      runValidators: true,
    }
  );
  if (!updatedUser) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "product updated successfully");
}
async function deleteProduct(req, res, next) {
  const { id } = req.params;
  const deletedUser = await productModel.findByIdAndDelete(id);
  if (!deletedUser) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "product Deleted");
}

export { createProduct, getProduct, updateProduct, deleteProduct };
