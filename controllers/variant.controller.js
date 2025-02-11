import { variantModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import {
  errorResponse,
  infoResponse,
  successResponse,
} from "../utils/apiResponse.js";
import { uploadToCloudinary } from "../middleware/uploadImage.js";
import mongoose from "mongoose";
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
  const { variants = [] } = req.body;

  const bulkOperations = variants.map((variant) => {
    const filter = {};

    // Match either variantId or skuId
    if (variant._id) {
      filter._id = new mongoose.Schema.Types.ObjectId(variant._id);
    }
    if (variant.sku) {
      filter.sku = variant.sku;
    }

    return {
      updateOne: {
        filter, // Match condition
        update: { $set: variant.data }, // Update fields
      },
    };
  });

  const result = await variantModel.bulkWrite(bulkOperations);

  if (!result) {
    return errorResponse(res, 400, "Failed to update variants");
  }
  return successResponse(res, 200, "variant update successfull");
}
async function deleteVariant(req, res, next) {
  const { id } = req.params;
  const deletedVa = await variantModel.findByIdAndDelete(id);
  if (!deletedVa) {
    let serverErr = new DatabaseError("failed to delete variant!!");
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
async function getProductsByColor(req, res, next) {
  let { color = "", limit = 5, skip = 0 } = req.query;

  const result = await variantModel.aggregate([
    { $sort: { createdAt: -1 } },
    { $skip: +skip },
    { $limit: +limit },
    // Step 1: Match variants by the given colors
    {
      $match: {
        color: color.toLowerCase(),
        // Filter variants by colors
      },
    },

    // Step 2: Lookup the related product details
    {
      $lookup: {
        from: "products", // Name of the products collection
        localField: "productId", // Link to productId in the variants
        foreignField: "_id", // Product _id
        as: "productDetails", // Output array for product details
      },
    },

    // Step 3: Unwind product details (since each variant is linked to one product)
    {
      $unwind: "$productDetails",
    },

    // Step 4: Group by product to consolidate variants and their details
    {
      $group: {
        _id: "$productDetails._id", // Group by productId
        name: { $first: "$productDetails.name" }, // Product name
        sku: { $first: "$productDetails.sku" }, // Product SKU
        category: { $first: "$productDetails.category" }, // Product category
        imgurl: { $first: "$productDetails.imgUrl" }, // Product image
        variants: {
          $push: {
            variantId: "$_id", // Variant ID
            color: "$color", // Variant color
            size: "$size", // Variant size
            basePrice: "$basePrice",
            sellPrice: "$sellPrice", // Variant price
            stock: "$stock", // Variant stock
            images: "$images", // Variant image
            discount: "$discount",
          },
        },
      },
    },

    // Step 5: Add a field for the total number of variants matching the colors
    {
      $addFields: {
        totalVariants: { $size: "$variants" }, // Count of all variants
        firstVariant: { $arrayElemAt: ["$variants", 0] }, // Get the first variant
        firstVariantImages: { $arrayElemAt: ["$variants.images", 0] }, // Get the first variant images
        firstVariantSellPrice: { $arrayElemAt: ["$variants.sellPrice", 0] }, // Get the first variant sellprice
        firstVariantDiscount: { $arrayElemAt: ["$variants.discount", 0] },
      },
    },

    // Step 6: Project only the required fields
    {
      $project: {
        _id: 1,
        name: 1,
        sku: 1,
        category: 1,
        imgurl: 1,
        firstVariant: 1,
        firstVariantImages: 1,
        firstVariantSellPrice: 1,
        firstVariantDiscount: 1,
        totalVariants: 1,
        variants: 1, // List of all variants matching the colors
      },
    },

    // Step 7: (Optional) Sort by totalVariants or any other field
    {
      $sort: { totalVariants: -1 }, // Sort products by number of matching variants
    },
  ]);
  if (!result) {
    return errorResponse(res, 400, "failed to get products");
  }

  return successResponse(res, 200, "successfull", result);
}
async function updateMany(req, res, next) {
  const { variants = [] } = req.body;

  if (!Array.isArray(variants) || !variants.length) {
    return errorResponse(res, 400, "Invalid or empty variants array");
  }
  //

  const bulkOperations = variants.reduce((ops, variant) => {
    // Construct filter with robust validation
    const filter = variant._id
      ? { _id: new mongoose.Types.ObjectId(variant._id) }
      : variant.sku
      ? { sku: variant.sku }
      : null;

    if (filter && variant.data) {
      ops.push({
        updateOne: {
          filter,
          update: { $set: { ...variant.data } },
          // upsert: true,  Optional: create document if not exists
        },
      });
    }

    return ops;
  }, []);

  // Throw if no valid operations
  if (!bulkOperations.length) {
    return errorResponse(res, 400, "No valid updates to process");
  }

  let result = await variantModel.bulkWrite(bulkOperations, {
    ordered: false, // Continue on error
    writeConcern: { w: 1 },
  });

  if (!result) {
    return errorResponse(res, 400, "Failed to update variants");
  }
  return successResponse(res, 200, "variant update successfull", result);
}

export {
  createVariant,
  getVariant,
  updateVariant,
  deleteVariant,
  createMany,
  imageUpload,
  getProductsByColor,
  updateMany,
};
