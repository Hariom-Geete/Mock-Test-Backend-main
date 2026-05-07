// test.validation.ts
import { z } from "zod";

export const createTestSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  duration: z.number().min(1),
  totalMarks: z.number().min(1),
  
  // 🔥 Naye fields add kiye hain jo frontend bhej raha hai
  marksPerQuestion: z.number().optional(),
  negativeMarking: z.number().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
  
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  
  batchIds: z.array(z.string()).optional(),
  
  proctoringEnabled: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  hideResults: z.boolean().optional(),
});

export const updateTestSchema = createTestSchema.partial();