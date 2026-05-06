import { z }
  from "zod";

export const createQuestionSchema =
  z.object({

    testId: z
      .string()
      .min(1),

    question: z
      .string()
      .min(5),

    options: z
      .array(
        z.string().min(1)
      )
      .min(2),

    correctAnswer: z
      .number()
      .min(0),

    explanation: z
      .string()
      .optional(),

    marks: z
      .number()
      .min(1)
      .optional(),

    negativeMarks: z
      .number()
      .min(0)
      .optional(),

    difficulty: z
      .enum([
        "easy",
        "medium",
        "hard",
      ])
      .optional(),

    subject: z
      .string()
      .optional(),

    topic: z
      .string()
      .optional(),

    order: z
      .number()
      .min(1)
      .optional(),
  });

export const updateQuestionSchema =
  createQuestionSchema.partial();