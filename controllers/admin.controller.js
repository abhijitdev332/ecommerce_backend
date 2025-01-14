import { productModel, cartModel } from "../models/models.js";
import { successResponse } from "../utils/apiResponse.js";
const getAllProduct = async (req, res, next) => {
  const productsWithStats = await productModel.aggregate([
    // Step 1: Lookup to get variants for each product
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
const getAllUsers = (req, res, next) => {};

export { getAllProduct, getProductWithVariants, getAllUsers };
