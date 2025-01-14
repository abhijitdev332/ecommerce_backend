import bcrypt from "bcryptjs";
import { DatabaseError } from "./customError.js";

const encrypt = async (pass) => {
  try {
    const hashedPass = await bcrypt.hash(pass, 12);
    return hashedPass;
  } catch (err) {
    let passErr = new DatabaseError(err.message);
    return passErr;
  }
};

const decrypt = async (userPass, DBPass) => {
  try {
    const hashedPass = await bcrypt.compare(userPass, DBPass);
    return hashedPass;
  } catch (err) {
    let passErr = new DatabaseError(err.message);
    return passErr;
  }
};

export { encrypt, decrypt };
