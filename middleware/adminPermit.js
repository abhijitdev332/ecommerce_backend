import { UnauthError } from "../lib/customError.js";
import { verifyToken } from "./verifyToken.js";

export const adminPermit = (req, res, next) => {
  // verify the jwt token
  verifyToken(req, res, () => {
    if (req?.user?.roles?.includes("admin")) {
      return next();
    } else {
      let authErr = new UnauthError();
      return next(authErr);
    }
  });
};
