import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [5, "Username must be at least 5 characters long"],
      maxlength: [20, "Username must not exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: Number,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [4, "Password must be at least 8 characters long"],
      // select: false, Exclude password by default
    },
    imgUrl: {
      type: String,
    },
    roles: {
      type: [String],
      enum: {
        values: ["USER", "MODERATOR", "ADMIN"],
        message: "{VALUE} is not a valid role",
      },
      default: ["USER"], // Default role is 'USER'
    },
    isActive: {
      type: Boolean,
      default: true, // Indicates if the user account is active
    },
  },
  { timestamps: true }
);

// Instance method to check if a user has a specific role
userSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
};

// Static method to retrieve users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ roles: role });
};
// virtual fileds
userSchema.virtual("tokenId").get(function () {});

const UserModal = mongoose.model("user", userSchema);
export default UserModal;
