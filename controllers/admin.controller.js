import {
  productModel,
  cartModel,
  userModel,
  productCate,
  orderModel,
} from "../models/models.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { RegulatoryComplianceListInstance } from "twilio/lib/rest/numbers/v2/regulatoryCompliance.js";
const getAllProduct = async (req, res, next) => {
  const productsWithStats = await productModel.aggregate([
    // Step 1: Lookup to get variants for each product
    {
      $lookup: {
        from: "variants", // Variant collection
        localField: "_id", // Product _id
        foreignField: "productId", // productId in Variant
        as: "variants",
      },
    },

    // Step 2: Lookup to get category details
    {
      $lookup: {
        from: "categories", // Category collection
        localField: "category", // Category IDs in Product
        foreignField: "_id", // _id in Category
        as: "categoryDetails",
      },
    },

    // Step 3: Add calculated fields
    {
      $addFields: {
        totalStock: { $sum: "$variants.stock" }, // Total stock across all variants
        firstVariant: { $arrayElemAt: ["$variants", 0] }, // Get the first variant
      },
    },

    // Step 4: Project the desired fields
    {
      $project: {
        _id: 1,
        name: 1,
        sku: 1, // Include SKU
        totalStock: 1,
        categoryDetails: 1, // Category name
        firstVariant: 1, //first variant to show
        createdAt: 1, // Product added date
      },
    },
  ]);

  return successResponse(res, 200, "all products stats", productsWithStats);
};
const getProductWithVariants = async (req, res, next) => {
  const { id } = req.params;
  const productWithStats = await productModel.aggregate([
    // Step 1: Match the product by ID
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

    // Step 2: Lookup to get variants for the product
    {
      $lookup: {
        from: "variants", // Name of the Variant collection
        localField: "_id", // Product _id
        foreignField: "productId", // productId in Variant
        as: "variants",
      },
    },

    // Step 2: Add fields for total variant count, total stock, and group by color and size
    {
      $addFields: {
        totalVariants: { $size: "$variants" }, // Count of all variants
        totalStock: {
          $sum: "$variants.stock", // Sum all stock values from variants
        },
        stockByVariant: {
          $arrayToObject: {
            $map: {
              input: {
                $reduce: {
                  input: "$variants",
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      "$$value",
                      [
                        {
                          color: "$$this.color",
                          size: "$$this.size",
                          stock: "$$this.stock",
                        },
                      ],
                    ],
                  },
                },
              },
            },
            as: "variantGroup",
            in: {
              k: {
                $concat: ["$$variantGroup.color", "-", "$$variantGroup.size"], // Combine color and size as key
              },
              v: "$$variantGroup.stock", // Stock as value
            },
          },
        },
        variantsByColor: {
          $arrayToObject: {
            $map: {
              input: {
                $group: {
                  _id: "$variants.color",
                  totalStock: { $sum: "$variants.stock" },
                },
              },
            },
          },
        },
      },
    },

    // Step 3: Project fields to include only relevant data
    {
      $project: {
        name: 1,
        category: 1,
        totalVariants: 1,
        totalStock: 1,
        stockByVariant: 1,
        variantsByColor: 1,
      },
    },
  ]);

  return successResponse(
    res,
    200,
    "Product with all variants",
    productWithStats
  );
};
const getAllUsers = async (req, res, next) => {
  const allUsers = await userModel.find({}, { password: 0 });

  if (!allUsers) {
    return errorResponse(res, 500, "failed to get all users");
  }
  return successResponse(res, 200, "succeesfull", allUsers);
};
const getAllCategories = async (req, res, next) => {
  const categoryStats = await productCate.aggregate([
    // Step 1: Lookup products linked to each category
    {
      $lookup: {
        from: "products", // Product collection
        localField: "_id", // _id in Category
        foreignField: "category", // category reference in Product
        as: "products",
      },
    },

    // Step 2: Unwind products to process them individually
    {
      $unwind: {
        path: "$products",
        preserveNullAndEmptyArrays: true, // Keep categories without products
      },
    },

    // Step 3: Lookup variants for each product
    {
      $lookup: {
        from: "variants", // Variant collection
        localField: "products._id", // Product _id
        foreignField: "productId", // productId in Variant
        as: "products.variants",
      },
    },

    // Step 4: Unwind variants to calculate stock and sales
    {
      $unwind: {
        path: "$products.variants",
        preserveNullAndEmptyArrays: true, // Keep products without variants
      },
    },

    // Step 5: Group by category to calculate stock, sales, and other stats
    {
      $group: {
        _id: "$_id", // Group by category ID
        categoryName: { $first: "$name" }, // Category name
        addedDate: { $first: "$createdAt" }, // Category added date
        totalStock: { $sum: "$products.variants.stock" }, // Total stock for the category
        totalSales: { $sum: "$products.variants.sold" }, // Total sales for the category
        productCount: { $addToSet: "$products._id" }, // Count unique products
      },
    },

    // Step 6: Add product count and handle missing data
    {
      $addFields: {
        productCount: { $size: "$productCount" }, // Convert product set to count
        categoryName: { $ifNull: ["$categoryName", "Unknown"] }, // Default category name
        addedDate: { $ifNull: ["$addedDate", null] }, // Handle missing addedDate
      },
    },

    // Step 7: Project the final fields
    {
      $project: {
        _id: 1,
        categoryName: 1,
        totalStock: 1,
        totalSales: 1,
        productCount: 1,
        addedDate: 1,
      },
    },
  ]);

  if (!categoryStats) {
    return errorResponse(res, 500, "failed to get all categories");
  }
  return successResponse(res, 200, "successfull", categoryStats);
};
const getAllOrders = async (req, res, next) => {
  const { limit = 5, skip = 0 } = req.query;
  const allOrders = await orderModel.find({}).limit(limit).skip(skip);

  if (!allOrders) {
    return errorResponse(res, 500, "failed to get all orders");
  }
  return successResponse(res, 200, "succesfull", allOrders);
};

export {
  getAllProduct,
  getProductWithVariants,
  getAllUsers,
  getAllCategories,
  getAllOrders,
};
