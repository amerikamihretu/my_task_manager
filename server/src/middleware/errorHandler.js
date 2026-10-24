export function errorHandler(err, req, res, _next) {
  console.error("[error]", err);

  if (res.headersSent) return;

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Avatar must be 2 MB or smaller."
        : "Avatar upload failed.";
    return res.status(400).json({ success: false, message });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with that email already exists",
    });
  }

  if (err.name === "CastError" && err.kind === "ObjectId") {
    return res.status(400).json({
      success: false,
      message: "Invalid id",
    });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  res.status(status).json({ success: false, message });
}
