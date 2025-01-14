class CustomError extends Error {
  constructor(msg, status) {
    super(msg);
    this.statusCode = status || 408;
    this.msg = msg || "Request Timeout";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthError extends CustomError {
  constructor(msg, status) {
    super(msg, status);
    this.statusCode = status || 401;
    this.msg = msg || "Unauthorized Request";
  }
}
export class ServerError extends CustomError {
  constructor(msg, status) {
    super(msg, status);
    this.statusCode = status || 500;
    this.msg = msg || "Internal server Error";
    this.isOperational = false;
  }
}
export class AppError extends CustomError {
  constructor(msg, status) {
    super(msg, status);
    this.statusCode = status || 400;
    this.msg = msg || "bad request";
    this.isOperational = false;
  }
}
export class DatabaseError extends CustomError {
  constructor(msg, status) {
    super(msg, status);
    this.statusCode = status || 500;
    this.msg = msg || "Database Error";
    this.isOperational = false;
  }
}

export default CustomError;
