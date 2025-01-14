const successResponse = (
  res,
  code = 200,
  message = "successfull",
  payload = []
) => {
  return res.status(code).json({
    message: message,
    data: payload,
  });
};
const infoResponse = (res, code = 404, message = "not found", payload = []) => {
  return res.status(code).json({
    message: message,
    data: payload,
  });
};
const errorResponse = (
  res,
  code = 500,
  message = "Server Error",
  payload = []
) => {
  return res.status(code).json({
    message: message,
    data: payload,
  });
};

export { successResponse, infoResponse, errorResponse };
