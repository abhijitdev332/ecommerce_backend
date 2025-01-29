import { orderModel, productModel, variantModel } from "../models/models.js";
import { AppError, DatabaseError, ServerError } from "../lib/customError.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
async function createProduct(req, res, next) {
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
async function getProduct(req, res, next) {
  const { id } = req.params;

  const matchedProduct = await productModel
    .findOne({ _id: id })
    .populate("reviews.user", { username: 1 });
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
  const variantDeleted = await variantModel.deleteMany({ productId: id });
  if (!variantDeleted) {
    let serverErr = new DatabaseError(
      "failed to delete Product and variants!!"
    );
    return next(serverErr);
  }
  const deletedUser = await productModel.findByIdAndDelete(id);
  if (!deletedUser) {
    let serverErr = new DatabaseError(
      "failed to delete products and variants!!"
    );
    return next(serverErr);
  }
  return successResponse(res, 200, "product Deleted");
}
async function addReview(req, res, next) {
  const { id } = req.params;
  const { userId, rating, comment } = req.body;

  const product = await productModel.findById(id);
  if (!product) {
    return next(new AppError("Can't find the product", 404));
  }

  product.reviews.push({
    user: userId,
    rating,
    comment,
  });
  await product.save();
  await productModel.calculateReviewStats(id);
  return successResponse(res, 200, "successfull");
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
  await productModel.calculateReviewStats(id);
  return successResponse(res, 200, "successfully deleted");
}
const getTopSellingProducts = async (req, res, next) => {
  const { limit = 4, skip = 0 } = req.query;
  try {
    const result = await orderModel.aggregate([
      // Step 1: Unwind the items array to process each variant in orders
      { $unwind: "$products" },

      // Step 2: Group by variantId to calculate total sales for each variant
      {
        $group: {
          _id: "$products.variantId", // Group by variantId
          totalSold: { $sum: "$products.quantity" }, // Calculate total quantity sold
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

      // Step 5: Group by product to calculate total sales and include all variants
      {
        $group: {
          _id: "$productDetails._id", // Group by productId
          name: { $first: "$productDetails.name" }, // Get product name
          description: { $first: "$productDetails.description" },
          averageRating: { $first: "$productDetails.averageRating" }, // Get product name
          sku: { $first: "$productDetails.sku" }, // Get product SKU
          totalProductSales: { $sum: "$totalSold" }, // Total sales for the product
          variants: {
            $push: {
              sku: "$variantDetails.sku",
              variantId: "$_id",
              color: "$variantDetails.color",
              size: "$variantDetails.size",
              sellPrice: "$variantDetails.sellPrice",
              totalSold: "$totalSold",
              discount: "$variantDetails.discount",
              images: "$variantDetails.images",
            },
          },
          totalVariants: { $sum: 1 }, // Count total variants
          firstVariant: { $first: "$variants" }, // Automatically get the first variant
        },
      },

      // Step 6: Sort products by total sales in descending order
      { $sort: { totalProductSales: -1 } },

      // Step 7: Limit results to the top-selling products
      { $limit: +limit },
      { $skip: +skip },
      // {
      //   $addFields: {
      //     firstVariantImages: { $arrayElemAt: ["$variantDetails.images", 0] }, // Get the first variant images
      //     firstVariantSellPrice: {
      //       $arrayElemAt: ["$variantDetails.sellPrice", 0],
      //     }, // Get the first variant sellprice
      //     firstVariantDiscount: {
      //       $arrayElemAt: ["$variantDetails.discount", 0],
      //     },
      //   },
      // },

      // Step 8: Project only the required fields
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          averageRating: 1,
          description: 1,
          totalProductSales: 1,
          totalVariants: 1,
          firstVariant: { $arrayElemAt: ["$variants", 0] }, // Ensure the first variant is included
          firstVariantImages: { $arrayElemAt: ["$variants.images", 0] },
          firstVariantSellPrice: { $arrayElemAt: ["$variants.sellPrice", 0] },
          firstVariantDiscount: { $arrayElemAt: ["$variants.discount", 0] },
          // variants: 1, // List of all variants
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
    { $limit: +limit },
    { $skip: +skip },

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
        firstVariantImages: {
          $arrayElemAt: ["$variants.images", 0], // Get the images of the first variant
        },
        firstVariantSellPrice: {
          $arrayElemAt: ["$variants.sellPrice", 0],
        },
        firstVariantBasePrice: {
          $arrayElemAt: ["$variants.basePrice", 0],
        },
        firstVariantDiscount: {
          $arrayElemAt: ["$variants.discount", 0],
        },
      },
    },

    // Step 5: Project required fields
    {
      $project: {
        name: 1,
        sku: 1,
        price: 1,
        imgurl: 1,
        averageRating: 1,
        description: 1,
        category: 1,
        createdAt: 1,
        totalVariants: 1,
        totalStock: 1,
        firstVariantImages: 1,
        firstVariantSellPrice: 1,
        firstVariantDiscount: 1,
        firstVariantBasePrice: 1,
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
async function getProductsByCategory(req, res, next) {
  const { query = "casual" } = req.query;
  const productsByCategory = await productModel.aggregate([
    // Step 1: Lookup to join categories
    {
      $lookup: {
        from: "categories", // Name of the categories collection
        localField: "category", // Field in products referencing category ID
        foreignField: "_id", // Field in categories being referenced
        as: "categoryInfo", // Alias for the joined data
      },
    },
    // Step 2: Match products by category name
    {
      $match: {
        "categoryInfo.categoryName": query, // Replace with the desired category name
      },
    },
    // Step 3: Lookup to join variants
    {
      $lookup: {
        from: "variants", // Name of the variants collection
        localField: "_id", // Field in products referencing the product ID
        foreignField: "productId", // Field in variants referencing the product ID
        as: "variants", // Alias for the joined data
      },
    },
    // Step 4: Add fields for total variants and first variant details
    {
      $addFields: {
        totalStock: { $sum: "$variants.stock" },
        totalVariants: { $size: "$variants" }, // Count the total variants
        firstVariant: { $arrayElemAt: ["$variants", 0] }, // Get the first variant
        firstVariantImages: { $arrayElemAt: ["$variants.images", 0] }, // Get the first variant images
        firstVariantSellPrice: { $arrayElemAt: ["$variants.sellPrice", 0] }, // Get the first variant sellprice
        firstVariantDiscount: { $arrayElemAt: ["$variants.discount", 0] },
      },
    },
    // Step 5: Project fields to include only relevant data
    {
      $project: {
        name: 1, // Product name
        price: 1, // Product price
        sku: 1, // SKU
        imgurl: 1, // Product image
        averageRating: 1,
        totalStock: 1, // Optional stock field
        createdAt: 1, // Creation date
        category: { $arrayElemAt: ["$categoryInfo.categoryName", 0] }, // Category name from lookup
        totalVariants: 1, // Total variants count
        firstVariantImages: 1,
        firstVariantSellPrice: 1,
        firstVariantDiscount: 1,
        "firstVariant.color": 1, // First variant color
        "firstVariant.size": 1, // First variant size
        "firstVariant.sellPrice": 1, // First variant price
        "firstVariant.stock": 1, // First variant stock
        "firstVariant.images": 1, // First variant image
        "firstVariant.discount": 1, // First variant discount
      },
    },
  ]);

  if (!productsByCategory) {
    return errorResponse(res, 400, "can't find products by this category");
  }

  return successResponse(res, 200, "successfull", productsByCategory);
}
async function getProductsBySubCategory(req, res, next) {
  const { query = "shirt" } = req.query;

  const productsByCategory = await productModel.aggregate([
    // Step 1: Lookup to join categories
    {
      $lookup: {
        from: "subcategories", // Name of the categories collection
        localField: "subCategory", // Field in products referencing category ID
        foreignField: "_id", // Field in categories being referenced
        as: "category", // Alias for the joined data
      },
    },
    // Step 2: Match products by category name
    {
      $match: {
        "category.SubCategoryName": query, // Replace with the desired category name
      },
    },
    // Step 3: Lookup to join variants
    {
      $lookup: {
        from: "variants", // Name of the variants collection
        localField: "_id", // Field in products referencing the product ID
        foreignField: "productId", // Field in variants referencing the product ID
        as: "variants", // Alias for the joined data
      },
    },
    // Step 4: Add fields for total variants and first variant details
    {
      $addFields: {
        totalStock: { $sum: "$variants.stock" },
        totalVariants: { $size: "$variants" }, // Count the total variants
        firstVariant: { $arrayElemAt: ["$variants", 0] }, // Get the first variant
        firstVariantImages: { $arrayElemAt: ["$variants.images", 0] }, // Get the first variant images
        firstVariantSellPrice: { $arrayElemAt: ["$variants.sellPrice", 0] }, // Get the first variant sellprice
        firstVariantDiscount: { $arrayElemAt: ["$variants.discount", 0] },
      },
    },
    // Step 5: Project fields to include only relevant data
    {
      $project: {
        name: 1, // Product name
        price: 1, // Product price
        sku: 1, // SKU
        imgurl: 1, // Product image
        averageRating: 1,
        totalStock: 1, // Optional stock field
        createdAt: 1, // Creation date
        category: { $arrayElemAt: ["$category.SubCategoryName", 0] }, // Category name from lookup
        totalVariants: 1, // Total variants count
        firstVariantImages: 1,
        firstVariantSellPrice: 1,
        firstVariantDiscount: 1,
        "firstVariant.color": 1, // First variant color
        "firstVariant.size": 1, // First variant size
        "firstVariant.sellPrice": 1, // First variant price
        "firstVariant.stock": 1, // First variant stock
        "firstVariant.images": 1, // First variant image
        "firstVariant.discount": 1, // First variant discount
      },
    },
  ]);

  if (!productsByCategory) {
    return errorResponse(res, 400, "can't find products by this category");
  }

  return successResponse(res, 200, "successfull", productsByCategory);
}

async function getProductOrderDetails(req, res, next) {
  let { productId = "", color = "" } = req.query;

  const productOrders = await orderModel.aggregate([
    // Step 1: Unwind products array to process each entry separately
    { $unwind: "$products" },

    // Step 2: Match orders that contain the given productId
    {
      $match: {
        "products.productId": new mongoose.Types.ObjectId(productId),
      },
    },

    // Step 3: Lookup variant details (fetching only those with the given color)
    {
      $lookup: {
        from: "variants",
        localField: "products.variantId",
        foreignField: "_id",
        as: "variantDetails",
      },
    },

    // Step 4: Filter out variants that do not match the given color
    {
      $match: {
        "variantDetails.color": color, // Match only color, ignore size
      },
    },

    // Step 5: Lookup product details
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    // Step 6: Group back orders with their respective products
    {
      $group: {
        _id: "$_id",
        userDetails: { $first: { $arrayElemAt: ["$userDetails", 0] } }, // Single user
        totalAmount: { $first: "$totalAmount" },
        discount: { $first: "$discount" },
        transactionId: { $first: "$transactionId" },
        paymentGateway: { $first: "$paymentGateway" },
        address: { $first: "$address" },
        status: { $first: "$status" },
        createdAt: { $first: "$createdAt" },
        products: {
          $push: {
            productId: "$products.productId",
            variantId: "$products.variantId",
            quantity: "$products.quantity",
            variantDetails: { $arrayElemAt: ["$variantDetails", 0] },
            productDetails: { $arrayElemAt: ["$productDetails", 0] },
          },
        },
      },
    },

    // Step 7: Project the final response structure
    {
      $project: {
        _id: 1,
        userDetails: {
          _id: 1,
          username: 1,
          email: 1,
        },
        totalAmount: 1,
        discount: 1,
        transactionId: 1,
        paymentGateway: 1,
        address: 1,
        status: 1,
        createdAt: 1,
        products: {
          productId: 1,
          variantId: 1,
          quantity: 1,
          variantDetails: {
            _id: 1,
            color: 1,
            images: 1,
            stock: 1,
          },
          productDetails: {
            _id: 1,
            name: 1,
            sku: 1,
            imgurl: 1,
          },
        },
        firstProduct: {
          productName: { $arrayElemAt: ["$products.productId.name", 0] }, // Get first product in the order
          variantId: { $arrayElemAt: ["$products.variantId", 0] },
          quantity: { $arrayElemAt: ["$products.quantity", 0] },
          variantImages: {
            $arrayElemAt: ["$products.variantDetails.images", 0],
          },
          productDetails: {
            name: { $arrayElemAt: ["$products.productDetails.name", 0] },
            sku: { $arrayElemAt: ["$products.productDetails.sku", 0] },
            imgurl: { $arrayElemAt: ["$products.productDetails.imgurl", 0] },
          },
        },
      },
    },
  ]);

  if (!productOrders) {
    return errorResponse(
      res,
      400,
      "No orders found for this product and variant"
    );
  }

  return successResponse(res, 200, "Successful", productOrders);
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
  getProductsByCategory,
  getProductsBySubCategory,
  getProductOrderDetails,
};
