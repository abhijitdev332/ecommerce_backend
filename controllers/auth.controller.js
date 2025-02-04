import { userModel, tokenModel } from "../models/models.js";
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

const verifySession = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || ""; // Get refresh token from cookies

  if (!refreshToken)
    return errorResponse(res, 403, "refresh Token is required");

  const storedToken = await tokenModel.findOne({ token: refreshToken });
  if (
    !storedToken ||
    dateFormat(storedToken.expireAt) < dateFormat(new Date())
  ) {
    return errorResponse(res, 403, "Invalid or expired refresh token.");
  }

  try {
    const { userId } = verifyRefreshToken(refreshToken);
    const user = await userModel.findById(userId, "-password");
    // Generate a new access token
    const newAccessToken = generateAccessToken(userId);

    // Set new access token in the cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 15 * 60 * 1000, //15m
    });

    return successResponse(res, 200, "Session return", user);
    // res.json({ message: "Access token refreshed." });
  } catch (err) {
    let appErr = new AppError("Invalid refresh token", 403);
    logMessage(errorLogger, "Failed to refresh token", err);
    next(appErr);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  // check the mail its match with any
  let user = await userModel.findOne({ email: email });
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
    let savedToken = new tokenModel({
      token: refreshToken,
      userId: resUser?._id,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7day
    });
    await savedToken.save();

    // setcookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 15 * 60 * 1000, //15m
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7day
    });
    return successResponse(res, 200, "Login Successfull", resUser);
    // res.status(200).json({ msg: "Login Successfull", data: resUser });
  } catch (err) {
    let passErr = new ServerError("Failed to login!!", 500);
    next(passErr);
  }
};
const refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies

  if (!refreshToken)
    return errorResponse(res, 403, "refresh Token is required");

  const storedToken = await tokenModel.findOne({ token: refreshToken });
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
const logout = async (req, res, next) => {
  try {
    let { userId } = req.user;
    let token = await tokenModel.deleteMany({ userId: userId });
    if (!token) {
      return errorResponse(res, 500, "Failed to logout");
    }
    res.clearCookie("accessToken", {
      path: "/", // Path of the cookie
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: process.env.NODE_ENV == "production" ? "none" : "",
    });
    res.clearCookie("refreshToken", {
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

export { verifySession, login, refreshToken, logout };
