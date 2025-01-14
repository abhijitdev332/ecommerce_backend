import { variantModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { infoResponse, successResponse } from "../utils/apiResponse.js";
async function createVariant(req, res, next) {
  const { productId, color, size } = req.body;
  const hadVariant = await variantModel.find({ productId, color, size });
  if (hadVariant) {
    return infoResponse(res, 400, "variant already existed");
  }
  const newVariant = new variantModel({ ...req.body });
  let savedVariant = await newVariant.save();
  if (!savedVariant) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  return successResponse(
    res,
    201,
    "Variant Created Successfully",
    savedVariant
  );
}
async function getVariant(req, res, next) {
  const { id } = req.params;

  const matchedVa = await variantModel.findOne({ productId: id });
  if (!matchedVa) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }

  return successResponse(res, 200, "sucessfull", matchedVa);
}
async function updateVariant(req, res, next) {
  const { id } = req.params;
  const { username, email, password } = req.body;

  const updatedVa = await variantModel.findByIdAndUpdate(
    id,
    { ...req.body },
    {
      runValidators: true,
    }
  );
  if (!updatedVa) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "Product Variant updated successfully");
}
async function deleteVariant(req, res, next) {
  const { id } = req.params;
  const deletedVa = await variantModel.findByIdAndDelete(id);
  if (!deletedVa) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "product variant Deleted");
}

export { createVariant, getVariant, updateVariant, deleteVariant };
