const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // If AppError, use its statusCode
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;
