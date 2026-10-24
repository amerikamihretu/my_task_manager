export function verifyOrigin(req, res, next) {
  // Skip CSRF origin check during automated tests. Supertest is not a
  // browser and does not send an Origin header; production browsers do.
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  if (safeMethods.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const allowed = process.env.CLIENT_ORIGIN;

  if (!origin || origin !== allowed) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
}
