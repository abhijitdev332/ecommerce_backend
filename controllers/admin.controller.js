import {
  productModel,
  cartModel,
  userModel,
  productCate,
  orderModel,
} from "../models/models.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

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
        totalVariants: {
          $size: {
            $ifNull: [
              {
                $setUnion: ["$variants.color"], // Find unique colors
              },
              [],
            ],
          },
        },
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
        totalVariants: 1,
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
        categoryName: { $first: "$categoryName" }, // Category name
        categoryImage: { $first: "$categoryImage" },
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
        categoryImage: { $ifNull: ["$categoryImage", "Unknown"] },
        addedDate: {
          $ifNull: ["$addedDate", new Date().toLocaleDateString("en-GB")],
        }, // Handle missing addedDate
      },
    },

    // Step 7: Project the final fields
    {
      $project: {
        _id: 1,
        categoryName: 1,
        categoryImage: 1,
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
const getOrdersDetails = async (req, res, next) => {
  const { orderId } = req.params;
  const orderDetails = await orderModel.aggregate([
    // Step 1: Match the specific order ID
    { $match: { _id: mongoose.Types.ObjectId(orderId) } },

    // Step 2: Lookup to fetch user details
    {
      $lookup: {
        from: "users", // User collection
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    // Step 3: Lookup to fetch address details
    {
      $lookup: {
        from: "addresses", // Address collection
        localField: "address",
        foreignField: "_id",
        as: "addressDetails",
      },
    },

    // Step 4: Unwind products array to process each product individually
    { $unwind: "$products" },

    // Step 5: Lookup to fetch product details
    {
      $lookup: {
        from: "products", // Product collection
        localField: "products.productId",
        foreignField: "_id",
        as: "products.productDetails",
      },
    },

    // Step 6: Lookup to fetch variant details
    {
      $lookup: {
        from: "variants", // Variant collection
        localField: "products.variantId",
        foreignField: "_id",
        as: "products.variantDetails",
      },
    },

    // Step 7: Group the data back into a single order document
    {
      $group: {
        _id: "$_id", // Order ID
        createdAt: { $first: "$createdAt" }, // Order creation date
        updatedAt: { $first: "$updatedAt" }, // Order update date
        userDetails: { $first: { $arrayElemAt: ["$userDetails", 0] } }, // Single user
        addressDetails: { $first: { $arrayElemAt: ["$addressDetails", 0] } }, // Single address
        products: {
          $push: {
            productId: "$products.productId",
            variantId: "$products.variantId",
            quantity: "$products.quantity",
            productDetails: { $arrayElemAt: ["$products.productDetails", 0] },
            variantDetails: { $arrayElemAt: ["$products.variantDetails", 0] },
          },
        },
        totalAmount: { $first: "$totalAmount" },
        paymentGateway: { $first: "$paymentGateway" },
        status: { $first: "$status" },
        transactionId: { $first: "$transactionId" },
      },
    },

    // Step 8: Project the required fields
    {
      $project: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        userDetails: {
          _id: 1,
          name: 1,
          email: 1,
        },
        addressDetails: {
          _id: 1,
          street: 1,
          city: 1,
          state: 1,
          postalCode: 1,
          country: 1,
        },
        products: {
          productId: 1,
          variantId: 1,
          quantity: 1,
          productDetails: {
            name: 1,
            sku: 1,
            category: 1,
          },
          variantDetails: {
            color: 1,
            size: 1,
            price: 1,
            stock: 1,
          },
        },
        totalAmount: 1,
        paymentGateway: 1,
        status: 1,
        transactionId: 1,
      },
    },
  ]);

  if (!orderDetails) {
    return errorResponse(res, 500, "failed to get all orders");
  }
  return successResponse(res, 200, "succesfull", orderDetails);
};
const getAllOrders = async (req, res, next) => {
  const { limit = 5, skip = 0 } = req.query;

  const orders = await orderModel.aggregate([
    // Step 1: Lookup to fetch user details
    {
      $lookup: {
        from: "users", // User collection
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    // Step 2: Lookup to fetch address details
    {
      $lookup: {
        from: "addresses", // Address collection
        localField: "address",
        foreignField: "_id",
        as: "addressDetails",
      },
    },

    // Step 3: Unwind the products array to process each product individually
    { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },

    // Step 4: Lookup to fetch product details
    {
      $lookup: {
        from: "products", // Product collection
        localField: "products.productId",
        foreignField: "_id",
        as: "products.productDetails",
      },
    },

    // Step 5: Lookup to fetch variant details
    {
      $lookup: {
        from: "variants", // Variant collection
        localField: "products.variantId",
        foreignField: "_id",
        as: "products.variantDetails",
      },
    },

    // Step 6: Group the data back by order
    {
      $group: {
        _id: "$_id", // Group by Order ID
        createdAt: { $first: "$createdAt" }, // Order creation date
        updatedAt: { $first: "$updatedAt" }, // Order update date
        userDetails: { $first: { $arrayElemAt: ["$userDetails", 0] } }, // Single user
        addressDetails: { $first: { $arrayElemAt: ["$addressDetails", 0] } }, // Single address
        products: {
          $push: {
            productId: "$products.productId",
            variantId: "$products.variantId",
            quantity: "$products.quantity",
            productDetails: { $arrayElemAt: ["$products.productDetails", 0] },
            variantDetails: { $arrayElemAt: ["$products.variantDetails", 0] },
          },
        },
        totalAmount: { $first: "$totalAmount" },
        paymentGateway: { $first: "$paymentGateway" },
        status: { $first: "$status" },
        transactionId: { $first: "$transactionId" },
      },
    },

    // Step 7: Add fields for first product and total product count
    {
      $addFields: {
        firstProduct: {
          productName: { $arrayElemAt: ["$products.productDetails.name", 0] }, // First product name
          variantImages: {
            $arrayElemAt: ["$products.variantDetails.images", 0], // First variant images
          },
        },
        totalProducts: { $size: "$products" }, // Total products in the product list
      },
    },

    // Step 8: Project the required fields
    {
      $project: {
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
        userDetails: {
          _id: 1,
          username: 1,
          email: 1,
        },
        addressDetails: {
          _id: 1,
          landMark: 1,
          houseNo: 1,
          city: 1,
          state: 1,
          pin: 1,
          country: 1,
        },
        products: {
          productId: 1,
          variantId: 1,
          quantity: 1,
          productDetails: {
            name: 1,
            sku: 1,
            category: 1,
          },
          variantDetails: {
            color: 1,
            size: 1,
            price: 1,
            stock: 1,
          },
        },
        totalAmount: 1,
        paymentGateway: 1,
        status: 1,
        transactionId: 1,
        firstProduct: 1,
        totalProducts: 1,
      },
    },
  ]);

  if (!orders) {
    return errorResponse(res, 500, "Failed to get all orders");
  }
  return successResponse(res, 200, "success full", orders);
};

export {
  getAllProduct,
  getProductWithVariants,
  getAllUsers,
  getAllCategories,
  getAllOrders,
  getOrdersDetails,
};
