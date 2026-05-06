import { z } from "zod";
import mongoose from "mongoose";

export const createStudentSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50)
    .trim(),

  email: z
    .string()
    .email("Invalid email")
    .toLowerCase()
    .trim(),

  batchId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid batchId",
    }),
});
// 🚨 NOTE: Maine yahan se .strict(), username, aur password hata diya hai.