import { errorLogger, httpLogger, logMessage } from "./logger.js";

export const globalErrorHandler = (err, _, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    status: "error",
    msg: err.msg || "Internal server Error!!",
  };

  if (err.statusCode <= 408) {
    logMessage(
      httpLogger,
      {
        msg: err.msg,
        message: err.message,
      },
      { error: err }
    );
  } else {
    logMessage(
      errorLogger,
      {
        msg: err.msg,
        message: err.message,
      },
      { error: err }
    );
  }

  res.status(statusCode).json(response);
};
