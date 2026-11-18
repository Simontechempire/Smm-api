module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: false,
      message: "Invalid input",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: false,
      message: "Invalid resource ID"
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      status: false,
      message: "Resource already exists"
    });
  }

  res.status(500).json({
    status: false,
    message: "Internal server error"
  });
};
