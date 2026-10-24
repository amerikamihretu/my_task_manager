import multer from "multer";

function fileFilter(_req, file, callback) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    const error = new Error("Avatar must be a JPEG, PNG, or WebP image.");
    error.statusCode = 400;
    return callback(error);
  }
  callback(null, true);
}

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
