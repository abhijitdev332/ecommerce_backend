import { cartModel, userModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { encrypt } from "../lib/encryptPass.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { uploadSingleToCloudinary } from "../middleware/uploadImage.js";
async function createUser(req, res, next) {
  // const { name, email, password, phone, role } = req.body;
  const { data } = req.body;

  let { displayName, email, password, phoneNumber, role } = JSON.parse(data);
  // const haveUser = await userModel.find({
  //   $or: [{ email: email }, { phoneNumber: phoneNumber }],
  // });
  // if (haveUser.length > 0) {
  //   let userErr = new AppError("User already in use!!", 400);
  //   return next(userErr);
  // }
  const fileBuffer = req?.file?.buffer; // File buffer from Multer
  const folder = "users"; // Cloudinary folder name
  let userImageUrl;
  if (fileBuffer) {
    userImageUrl = await uploadSingleToCloudinary(fileBuffer, folder);
  }

  let encryptPass = await encrypt(password);
  const user = new userModel({
    username: displayName,
    email,
    password: encryptPass,
    phoneNumber: phoneNumber,
    roles: [role?.toUpperCase()] || null,
    imgUrl: userImageUrl?.url || "",
  });
  let savedUser = await user.save();
  if (!savedUser) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }
  // create new cart

  let resUser = { ...savedUser._doc };
  let newCart = new cartModel({ userId: resUser?._id });
  if (!newCart) {
    await userModel.deleteOne({ _id: resUser?._id });
    return errorResponse(400, "failed to create user!!");
  }
  // send sms to user
  delete resUser?.password;
  return successResponse(res, 201, "User Created Successfully", resUser);
  //  res.status(201).json({
  //   msg: "User Created Successfully",
  //   data: resUser,
  // });
}
async function uploadImage(req, res, next) {
  const fileBuffer = req?.file?.buffer; // File buffer from Multer
  const folder = "users"; // Cloudinary folder name
  let userImageUrl;
  if (fileBuffer) {
    userImageUrl = await uploadSingleToCloudinary(fileBuffer, folder);
    return successResponse(res, 200, "succesfully uploaded", userImageUrl?.url);
  }
  return errorResponse(res, 400, "Something went wrong");
}
async function getUser(req, res, next) {
  const { id } = req.params;

  const matchedUser = await userModel.findOne({ _id: id }, { password: 0 });
  if (!matchedUser) {
    let userErr = new AppError("can't find any user", 400);
    return next(userErr);
  }

  return res.status(200).json({
    msg: "successfull",
    data: matchedUser,
  });
}
async function updateUser(req, res, next) {
  const { id } = req.params;
  const { username, email } = req.body;

  const fileBuffer = req?.file?.buffer; // File buffer from Multer
  const folder = "users"; // Cloudinary folder name
  let userImageUrl;
  let updatedUser;
  if (fileBuffer) {
    userImageUrl = await uploadSingleToCloudinary(fileBuffer, folder);

    updatedUser = await userModel
      .findByIdAndUpdate(
        id,
        { username, email, imgUrl: userImageUrl?.url },
        {
          runValidators: true,
        }
      )
      .select({ password: 0 });
  }

  updatedUser = await userModel
    .findByIdAndUpdate(
      id,
      { username, email },
      {
        runValidators: true,
      }
    )
    .select({ password: 0 });
  if (!updatedUser) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  res.status(200).json({
    message: "User updated Successfully",
    data: updatedUser,
  });
}
async function updateUserRole(req, res, next) {
  const { id } = req.params;
  const { role } = req.body;

  const updatedUser = await userModel.findByIdAndUpdate(id, { roles: [role] });
  if (!updatedUser) {
    return errorResponse(res, 400, "Failed to update user role");
  }
  return successResponse(res, 200, "Status Updated");
}
async function deleteUser(req, res, next) {
  const { id } = req.params;
  const deletedUser = await userModel.findByIdAndDelete(id);
  if (!deletedUser) {
    let serverErr = new DatabaseError("failed to delete user!!");
    return next(serverErr);
  }
  res.status(200).json({
    msg: "User deleted successfully",
  });
}

export {
  createUser,
  getUser,
  updateUser,
  updateUserRole,
  deleteUser,
  uploadImage,
};
