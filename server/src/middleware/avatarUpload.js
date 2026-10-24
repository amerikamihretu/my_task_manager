import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const avatarDirectory = path.resolve("uploads", "avatars");

fs.mkdirSync(avatarDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, avatarDirectory);
  },
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

function fileFilter(_req, file, callback) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    const error = new Error("Avatar must be a JPEG, PNG, or WebP image.");
    error.statusCode = 400;
    return callback(error);
  }
  callback(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
