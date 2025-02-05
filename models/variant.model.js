import mongoose, { Schema } from "mongoose";
const VariantSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    color: { type: String, required: true, index: true },
    size: { type: String, required: true },
    basePrice: { type: Number, default: 0 },
    sellPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sold: {
      type: Number,
      default: 0, // Track the number of items sold for this specific variant
    },
    discount: {
      type: String,
      default: "0",
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);
// static method
VariantSchema.statics.calculateDiscount = function (basePrice, sellPrice) {
  if (!basePrice || basePrice <= sellPrice) {
    return "0"; // No discount if no base price or sellPrice is not lower
  }
  const discount = ((basePrice - sellPrice) / basePrice) * 100;
  return `${discount.toFixed(0)}`;
};
// Pre-save hook to automatically calculate discount
VariantSchema.pre("save", function (next) {
  this.discount = VariantSchema.statics.calculateDiscount(
    this.basePrice,
    this.sellPrice
  );
  next();
});
// For bulk operations
VariantSchema.pre("updateOne", function (next) {
  const update = this.getUpdate();
  if (update.basePrice || update.sellPrice) {
    const basePrice = update.basePrice || this.basePrice;
    const sellPrice = update.sellPrice || this.sellPrice;
    update.discount = VariantSchema.statics.calculateDiscount(
      basePrice,
      sellPrice
    );
  }
  next();
});
// For updateMany operations
VariantSchema.pre("updateMany", function (next) {
  const update = this.getUpdate();
  if (update.basePrice || update.sellPrice) {
    const basePrice = update.basePrice || this.basePrice;
    const sellPrice = update.sellPrice || this.sellPrice;
    update.discount = VariantSchema.statics.calculateDiscount(
      basePrice,
      sellPrice
    );
  }
  next();
});
VariantSchema.pre("bulkWrite", async function (next, ops) {
  try {
    // ops contains the array of operations
    for (const op of ops) {
      if (op.insertOne) {
        const doc = op.insertOne.document;
        doc.discount = VariantSchema.statics.calculateDiscount(
          doc.basePrice,
          doc.sellPrice
        );
      } else if (op.updateOne || op.updateMany) {
        const update = op.updateOne?.update || op.updateMany?.update;
        if (update.$set) {
          const basePrice = update.$set.basePrice;
          const sellPrice = update.$set.sellPrice;

          if (basePrice !== undefined || sellPrice !== undefined) {
            if (basePrice === undefined || sellPrice === undefined) {
              const filter = op.updateOne?.filter || op.updateMany?.filter;
              const existingDoc = await this.model.findOne(filter);
              if (existingDoc) {
                update.$set.discount = VariantSchema.statics.calculateDiscount(
                  basePrice ?? existingDoc.basePrice,
                  sellPrice ?? existingDoc.sellPrice
                );
              }
            } else {
              update.$set.discount = VariantSchema.statics.calculateDiscount(
                basePrice,
                sellPrice
              );
            }
          }
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

const productVariantModel = mongoose.model("variant", VariantSchema);

export default productVariantModel;
