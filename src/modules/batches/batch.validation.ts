import { z } from "zod";

export const createBatchSchema = z
  .object({
    name: z
      .string()
      .min(2, "Batch name too short")
      .max(50)
      .trim(),

    description: z.string().optional(),

    startDate: z.string().optional(),

    endDate: z.string().optional(),

    status: z
      .enum(["active", "inactive"])
      .optional(),
  })
  .strict();

export const updateBatchSchema =
  createBatchSchema;