import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * 🔐 Env schema validation
 */
const envSchema = z.object({
  PORT: z.string().default("5000"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * 🔍 Parse & validate env
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

/**
 * ✅ Export clean env object
 */
export const env = parsed.data;