import { z }
from "zod";

export const createTestSchema =
z.object({

  title: z
    .string()
    .min(3)
    .max(120),

  description: z
    .string()
    .optional(),

  duration: z
    .number()
    .min(1),

  totalMarks: z
    .number()
    .min(1),

  negativeMarking: z
    .number()
    .min(0)
    .optional(),

  status: z
    .enum([
      "draft",
      "published",
    ])
    .optional(),

  startDate: z
    .string()
    .optional(),

  endDate: z
    .string()
    .optional(),

  batchIds: z
    .array(z.string())
    .optional(),
});

export const updateTestSchema =
createTestSchema.partial();