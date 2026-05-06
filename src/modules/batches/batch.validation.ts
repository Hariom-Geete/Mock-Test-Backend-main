import { z } from "zod";

export const createBatchSchema = z
  .object({
    name: z
      .string()
      .min(2, "Batch name too short")
      .max(50)
      .trim(),
  })
  .strict();