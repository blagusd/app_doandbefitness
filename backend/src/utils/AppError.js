class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // error is expected (e.g. validation)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
