import { UnauthError } from "../lib/customError.js";
import { verifyToken } from "./verifyToken.js";
import { userModel } from "../models/models.js";
export const adminPermit = (req, res, next) => {
  // verify the jwt token
  verifyToken(req, res, async () => {
    if (req?.user?.userId) {
      const user = await userModel.findById(req.user?.userId, "-password");
      if (user?.roles?.includes("ADMIN")) {
        return next();
      }
    } else {
      let authErr = new UnauthError();
      return next(authErr);
    }
  });
};
