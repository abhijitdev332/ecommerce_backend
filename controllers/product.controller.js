import { productModel, variantModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
async function createProduct(req, res, next) {
  const { username, email, phoneNumber, password } = req.body;
  // const haveUser = await productModel.find({
  //   $or: [{ email: email }, { phoneNumber: phoneNumber }],
  // });
  // if (haveUser.length > 0) {
  //   let userErr = new AppError("User already in use!!", 400);
  //   return next(userErr);
  // }
  const newProduct = new productModel({ ...req.body });
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
const getTopSellingProducts = async (req, res, next) => {
  const { limit = 4, skip = 0 } = req.query;
  try {
    const result = await Order.aggregate([
      // Step 1: Unwind the items array to process each variant in orders
      { $unwind: "$items" },

      // Step 2: Group by variantId to calculate total sales for each variant
      {
        $group: {
          _id: "$items.variantId", // Group by variantId
          totalSold: { $sum: "$items.quantity" }, // Calculate total quantity sold
        },
      },

      // Step 3: Lookup variant details (to get productId, color, size, etc.)
      {
        $lookup: {
          from: "variants", // Variant collection
          localField: "_id", // Variant ID
          foreignField: "_id",
          as: "variantDetails",
        },
      },
      { $unwind: "$variantDetails" }, // Unwind variant details

      // Step 4: Lookup product details (to get product name, SKU, etc.)
      {
        $lookup: {
          from: "products", // Product collection
          localField: "variantDetails.productId", // Link to productId
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Unwind product details

      // Step 5: Group by product to calculate total sales for each product
      {
        $group: {
          _id: "$productDetails._id", // Group by productId
          productName: { $first: "$productDetails.name" }, // Get product name
          sku: { $first: "$productDetails.sku" }, // Get product SKU
          totalProductSales: { $sum: "$totalSold" }, // Total sales for the product
          variants: {
            $push: {
              variantId: "$_id",
              color: "$variantDetails.color",
              size: "$variantDetails.size",
              totalSold: "$totalSold",
            },
          },
        },
      },

      // Step 6: Sort products by total sales in descending order
      { $sort: { totalProductSales: -1 } },

      // Step 7: Limit to the top-selling product
      { $limit: limit },
      { $skip: skip },

      // Step 8: Add a field for the top-selling variant of the product
      {
        $addFields: {
          topSellingVariant: {
            $arrayElemAt: [
              {
                $slice: [
                  {
                    $sortArray: {
                      input: "$variants",
                      sortBy: { totalSold: -1 },
                    },
                  },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },

      // Step 9: Project only the required fields
      {
        $project: {
          _id: 1,
          productName: 1,
          sku: 1,
          totalProductSales: 1,
          topSellingVariant: 1,
        },
      },
    ]);

    return successResponse(res, 200, "Sucessfull", result);
  } catch (error) {
    next(new ServerError("Failed to get top selling products"));
  }
};
const newArrivalsProducts = async (req, res, next) => {
  const { limit = 4, skip = 0 } = req.query;
  const newArrivals = await productModel.aggregate([
    // Step 1: Sort products by createdAt in descending order
    { $sort: { createdAt: -1 } },

    // Step 2: Limit the number of results
    { $limit: limit },
    { $skip: skip },

    // Step 3: Lookup to get variants for each product
    {
      $lookup: {
        from: "variants", // Name of the Variant collection
        localField: "_id", // Product _id
        foreignField: "productId", // productId in Variant
        as: "variants",
      },
    },

    // Step 4: Add fields for total variant count and total stock
    {
      $addFields: {
        totalVariants: { $size: "$variants" }, // Count of all variants
        totalStock: { $sum: "$variants.stock" }, // Total stock across all variants
      },
    },

    // Step 5: Project required fields
    {
      $project: {
        name: 1,
        sku: 1,
        price: 1,
        imgurl: 1,
        category: 1,
        createdAt: 1,
        totalVariants: 1,
        totalStock: 1,
      },
    },
  ]);

  if (!newArrivals) {
    return next(new ServerError("Failed to get new arival products"));
  }
  return successResponse(res, 200, "Successfull", newArrivals);
};
const getProductByGender = async (req, res, next) => {
  const { gender = "male" } = req.query;
  const genderproducts = await productModel.find({ genderFor: gender });
  if (genderproducts?.length > 0) {
    return successResponse(res, 200, "successfull", genderproducts);
  }

  return errorResponse(res, 400, "failed to get by for this category");
};

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
async function addReview(req, res, next) {
  const { id } = req.params;
  const { userId, name, rating, comment } = req.body;

  const product = await productModel.findById(id);
  if (!product) {
    return next(new AppError("Can't find the product", 404));
  }

  product.reviews.push({
    user: userId,
    name,
    rating,
    comment,
  });
  await product.save();
}
async function deleteReview(req, res, next) {
  const { id } = req.params;

  const { reviewId } = req.query;

  const product = await productModel.findById(id);
  if (!product) {
    return next(new AppError("Can't find the product", 404));
  }
  let inx = product?.reviews?.findIndex((ele) => ele?._id == reviewId);
  product.reviews.splice(inx, 1);
  await product.save();

  await product.save();
}

export {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  getTopSellingProducts,
  getProductByGender,
  newArrivalsProducts,
};
