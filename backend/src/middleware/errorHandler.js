// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || {};
  
  res.status(status).json({
    success: false,
    code: status,
    message,
    ...(Object.keys(errors).length > 0 && { errors })
  });
};

// Custom error class
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = {
  errorHandler,
  AppError
};
