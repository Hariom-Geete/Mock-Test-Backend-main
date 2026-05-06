import { z } from "zod";

/**
 * 🔐 Strong password regex
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    "Password must contain at least one letter and one number"
  );

/**
 * ✅ Register Institute Schema
 */
export const registerSchema = z
  .object({

    adminName: z
      .string()
      .min(3, "Admin name must be at least 3 characters")
      .max(50, "Admin name too long")
      .trim(),

    instituteName: z
      .string()
      .min(2, "Institute name is required")
      .max(100, "Institute name too long")
      .trim(),

    email: z
      .string()
      .email("Invalid email")
      .toLowerCase()
      .trim(),

    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z
      .string()
      .min(3, "Identifier is required")
      .transform((val) => val.toLowerCase().trim()),

    password: z.string().min(1, "Password is required"),
  })
  .strict();

/**
 * ✅ Forgot Password Schema 
 */

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email")
      .toLowerCase()
      .trim(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .strict();

export const changePasswordSchema =
  z.object({

    currentPassword:
      z.string()
        .min(1, "Current password is required"),

    newPassword:
      z.string()
        .min(8, "Password must be at least 8 characters"),
  });