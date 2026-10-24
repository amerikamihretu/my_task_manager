import { z } from "zod";

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

const password = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters"); // bcrypt input limit

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required")
      .max(80, "Name cannot exceed 80 characters"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: password,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(1, "Name is required")
      .max(80, "Name cannot exceed 80 characters"),
    email,
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});
