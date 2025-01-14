import mongoose, { Schema } from "mongoose";

const SKUSchema = new mongoose.Schema({
  productCategory: {
    type: String,
  },
  productsId: {
    type: [Schema.Types.ObjectId],
    required: [true, "Please enter valid productsId"],
    validate: {
      validator: function (v) {
        return this.productsId.includes(v);
      },
      message: (prop) => `${prop.value} already exist`,
    },
  },
});

const productSkuModal = mongoose.model("SKU", SKUSchema);

export { productSkuModal };
