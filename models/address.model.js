import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    landMark: {
      type: String,
    },
    houseNo: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      enum: {
        values: ["india", "usa", "uk", "canada"],
        message: "{VALUE} is not a valid country",
      },
    },
    pin: {
      type: Number,
    },
  },
  { timestamps: true }
);

const addressModel = mongoose.model("address", AddressSchema);
export default addressModel;
