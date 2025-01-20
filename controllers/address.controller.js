import { addressModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { infoResponse, successResponse } from "../utils/apiResponse.js";
async function createAddress(req, res, next) {
  const newAddress = new addressModel({ ...req.body });
  let savedAddress = await newAddress.save();
  if (!savedAddress) {
    let addressErr = new DatabaseError("Failed to create new Address");
    return next(addressErr);
  }

  return successResponse(
    res,
    201,
    "address Created Successfully",
    savedAddress
  );
}
async function getAddress(req, res, next) {
  const { id } = req.params;

  const matchedAddress = await addressModel.findById(id);
  if (!matchedAddress) {
    let addressErr = new AppError("can't find any addresses", 400);
    return next(addressErr);
  }

  return successResponse(res, 200, "sucessfull", matchedAddress);
}
async function updateAddress(req, res, next) {
  const { id } = req.params;

  const updatedAddress = await addressModel.findByIdAndUpdate(
    id,
    { ...req.body },
    {
      runValidators: true,
    }
  );
  if (!updatedAddress) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  return successResponse(res, 200, "Address updated successfully");
}
async function deleteAddress(req, res, next) {
  const { id } = req.params;
  const deletedAddress = await addressModel.findByIdAndDelete(id);
  if (!deletedAddress) {
    let serverErr = new DatabaseError("failed to delete Address!!");
    return next(serverErr);
  }
  return successResponse(res, 200, "Address Deleted");
}

export { createAddress, getAddress, updateAddress, deleteAddress };
