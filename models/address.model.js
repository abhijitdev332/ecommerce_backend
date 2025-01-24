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
      required: true,
    },
    houseNo: {
      type: String,
    },
    city: {
      type: String,
      required: true,
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
      required: true,
      enum: {
        values: ["india", "usa", "uk", "canada"],
        message: "{VALUE} is not a valid country",
      },
    },
    pin: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const addressModel = mongoose.model("address", AddressSchema);
export default addressModel;
