import { variantModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import {
  errorResponse,
  infoResponse,
  successResponse,
} from "../utils/apiResponse.js";
import { uploadToCloudinary } from "../middleware/uploadImage.js";
async function createVariant(req, res, next) {
  const { productId, sku, color, size } = req.body;
  // const hadVariant = await variantModel.find({ productId, color, size, sku });
  // if (hadVariant) {
  //   return infoResponse(res, 400, "variant already existed");
  // }
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
async function createMany(req, res, next) {
  const { variantsArr } = req.body;

  const variantsData = await variantModel.insertMany(variantsArr);

  if (!variantsData) {
    return errorResponse(res, 500, "Failed create varinats");
  }

  return successResponse(res, 201, "succesfull", variantsData);
}
async function imageUpload(req, res, next) {
  try {
    const folder = "ecommerce"; // Replace with your Cloudinary folder name
    const files = req.files;

    if (!files || files.length === 0) {
      return errorResponse(res, 400, "No images provided.");
      //  res.status(400).json({ message: });
    }

    // Upload each file to Cloudinary
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, folder)
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Map each uploaded image to its secure_url
    const imageUrls = uploadResults.map((result) => ({
      url: result?.secure_url, // Cloudinary URL for the image
      publicId: result?.public_id, // Optional: Store public ID for future management
    }));

    // Send image URLs back to the client
    return successResponse(res, 201, "images upload successfull", [
      ...imageUrls,
    ]);
    // res.status(200).json({
    //   message: "Images uploaded successfully.",
    //   imageUrls,
    // });
  } catch (err) {
    let uploadErr = new ServerError("Failed to upload image in Database!!");
    next(uploadErr);
  }
}

export {
  createVariant,
  getVariant,
  updateVariant,
  deleteVariant,
  createMany,
  imageUpload,
};
