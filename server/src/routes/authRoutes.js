import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/authValidators.js";
import { validate } from "../middleware/validate.js";
import { uploadAvatar } from "../middleware/avatarUpload.js";
import { requireAuth } from "../middleware/auth.js";
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  removeAvatar,
  changePassword,
  startGoogleAuth,
  finishGoogleAuth,
} from "../controllers/authController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/google", startGoogleAuth);
router.get("/google/callback", finishGoogleAuth);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.patch(
  "/profile",
  requireAuth,
  uploadAvatar.single("avatar"),
  validate(updateProfileSchema),
  updateProfile,
);
router.delete("/profile/avatar", requireAuth, removeAvatar);
router.post(
  "/password",
  requireAuth,
  validate(changePasswordSchema),
  changePassword,
);

export default router;
