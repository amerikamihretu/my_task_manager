import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import {
  deleteAvatarFromCloudinary,
  uploadAvatarToCloudinary,
} from "../config/cloudinary.js";

const SALT_ROUNDS = 10;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE_MS),
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists",
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash });

    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions());

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.cookie("token", token, cookieOptions());

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out" });
}

export async function me(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
      },
    },
  });
}

export async function updateProfile(req, res, next) {
  let uploadedAvatar = null;

  try {
    const updates = { name: req.body.name };
    if (req.file) {
      uploadedAvatar = await uploadAvatarToCloudinary(req.file.buffer);
      updates.avatar = uploadedAvatar.url;
      updates.avatarPublicId = uploadedAvatar.publicId;
    }

    const currentUser = await User.findById(req.user._id);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (uploadedAvatar && currentUser?.avatarPublicId) {
      await deleteAvatarFromCloudinary(currentUser.avatarPublicId);
    }

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    if (uploadedAvatar?.publicId) {
      try {
        await deleteAvatarFromCloudinary(uploadedAvatar.publicId);
      } catch (cleanupError) {
        console.error("[cloudinary] Failed to clean up avatar:", cleanupError.message);
      }
    }
    next(error);
  }
}

export async function removeAvatar(req, res, next) {
  try {
    const currentUser = await User.findById(req.user._id);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: null, avatarPublicId: null } },
      { new: true },
    );

    if (currentUser?.avatarPublicId) {
      await deleteAvatarFromCloudinary(currentUser.avatarPublicId);
    }
    res.status(200).json({ success: true, data: { user: user.toJSON() } });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}
