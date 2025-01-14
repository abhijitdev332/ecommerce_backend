import { UserModal } from "../models/user.model.js";
import { tokenModal } from "../models/token.modal.js";
import { ServerError, AppError } from "../lib/customError.js";
import { decrypt } from "../lib/encryptPass.js";
import { logMessage, errorLogger } from "../utils/logger.js";
import {
  successResponse,
  infoResponse,
  errorResponse,
} from "../utils/apiResponse.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/createToken.js";
import { dateFormat } from "../utils/utills.js";
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  // check the mail its match with any
  let user = await UserModal.findOne({ email: email });
  if (!user) {
    logMessage(errorLogger, "No user found on this Email", { email });
    return infoResponse(res, 404, "Not found any user on this Email");
  }

  try {
    let passCheck = await decrypt(password, user?.password);
    if (!passCheck) {
      let passErr = new AppError("Password don't matched", 400);
      return errorResponse(res, passErr.statusCode, passErr.msg);
    }
    // let secret = process.env.jwtSecret;
    let resUser = { ...user._doc };
    // delete password key
    delete resUser?.password;
    // assign cookie
    const accessToken = generateAccessToken(resUser?._id);
    const refreshToken = generateRefreshToken(resUser?._id);
    // save refreshtoken in database
    let savedToken = new tokenModal({
      token: refreshToken,
      userId: resUser?._id,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await savedToken.save();

    // setcookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return successResponse(res, 200, "Login Successfull", resUser);
    // res.status(200).json({ msg: "Login Successfull", data: resUser });
  } catch (err) {
    let passErr = new ServerError("Failed to login!!", 500);
    next(passErr);
  }
};
export const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  if (!refreshToken)
    return errorResponse(res, 403, "refresh Token is required");

  const storedToken = await tokenModal.findOne({ token: refreshToken });
  if (
    !storedToken ||
    dateFormat(storedToken.expireAt) < dateFormat(new Date())
  ) {
    return errorResponse(res, 403, "Invalid or expired refresh token.");
  }

  try {
    const { userId } = verifyRefreshToken(refreshToken);

    // Generate a new access token
    const newAccessToken = generateAccessToken(userId);

    // Set new access token in the cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 15 * 60 * 1000, //15m
    });

    return successResponse(res, 200, "access token refreshed");
    // res.json({ message: "Access token refreshed." });
  } catch (err) {
    let appErr = new AppError("Invalid refresh token", 403);
    logMessage(errorLogger, "Failed to refresh token", err);
    next(appErr);
  }
};
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      path: "/", // Path of the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
    });
    return successResponse(res, 200, "Logout Successfull");
  } catch (err) {
    let logoutErr = new ServerError("Failed to logout!!");
    next(logoutErr);
  }
};
