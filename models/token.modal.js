import mongoose, { Schema } from "mongoose";

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: [true, "user info is required"],
  },
  expireAt: {
    type: Date,
  },
});

const tokenModal = mongoose.model("token", tokenSchema);

export { tokenModal };
