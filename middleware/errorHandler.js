

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Kuch galat ho gaya server mein";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

// Custom error class - isse hum apne controllers mein specific status code de sakte hain
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, ApiError };