import { ZodError } from "zod";

export const validateData = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          msg: err.errors[0].message,
        });
      } else {
        res.status(500).json({
          msg: "Internal server Error!!",
        });
      }
    }
  };
};
