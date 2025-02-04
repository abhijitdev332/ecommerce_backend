import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
    addressLine: {
      type: String,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "variant",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 50 },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentGateway: {
      type: String,
      enum: {
        values: ["card", "upi", "online banking", "applePay"],
        message: "{VALUE} is not a valid gateway",
      },
      default: "card",
    },
    status: {
      type: "string",
      enum: {
        values: ["pending", "shipped", "delivered"],
        message: "{VALUE} is not a status type",
      },
      default: "pending",
    },
  },
  { timestamps: true }
);
orderSchema.pre("save", async function (next) {
  if (!this.addressLine && this.address) {
    try {
      const Address = mongoose.model("address");
      const addressDoc = await Address.findById(this.address).lean();

      if (addressDoc) {
        const { houseNo, landMark, city, district, state, country, pin } =
          addressDoc;

        // Construct address line dynamically
        const formattedAddress = [
          houseNo,
          landMark,
          city,
          district,
          state,
          country?.toUpperCase(), // Convert country to uppercase for consistency
          pin,
        ]
          .filter(Boolean) // Remove any undefined or empty fields
          .join(", ");

        this.addressLine = formattedAddress;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
