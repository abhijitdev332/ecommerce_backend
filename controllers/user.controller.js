import { userModel } from "../models/models.js";
import { AppError, DatabaseError } from "../lib/customError.js";
import { encrypt } from "../lib/encryptPass.js";
import { successResponse } from "../utils/apiResponse.js";
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
    roles: [role?.toUpperCase()],
    imgUrl: userImageUrl?.url || "",
  });
  let savedUser = await user.save();
  if (!savedUser) {
    let userErr = new DatabaseError("Failed to create user!!");
    return next(userErr);
  }

  let resUser = { ...savedUser._doc };
  // send sms to user
  delete resUser?.password;
  return successResponse(res, 201, "User Created Successfully", resUser);
  //  res.status(201).json({
  //   msg: "User Created Successfully",
  //   data: resUser,
  // });
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
  const { username, email, password } = req.body;

  const updatedUser = await userModel.findByIdAndUpdate(
    id,
    { username, email, password },
    {
      runValidators: true,
    }
  );
  if (!updatedUser) {
    let serverErr = new DatabaseError("Failed to update user!!");
    return next(serverErr);
  }

  res.status(200).json({
    msg: "User updated Successfully",
    data: updatedUser,
  });
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

export { createUser, getUser, updateUser, deleteUser };
