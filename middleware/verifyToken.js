// import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../lib/createToken.js";
import { UnauthError } from "../lib/customError.js";
export const verifyToken = (req, res, next) => {
  // VERIFY TOKEN
  let token = req.cookies.accessToken;
  if (token) {
    let data = verifyAccessToken(token);
    if (!data) {
      let authErr = new UnauthError("Token is invalid or expired", 401);
      return next(authErr);
    } else {
      req.userId = data;
      return next();
    }
  } else {
    let authErr = new UnauthError("You are not authenticated!!");
    return next(authErr);
  }

  // your are not autheitceted
};
