import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { AppError } from "../../shared/utils/AppError.js";
import {
  extractTextFromImage,
  extractTextFromPDF, 
  generateMockTestJSON,
} from "./ai.service.js";
import { createTest } from "../tests/test.service.js";
import { createQuestion } from "../questions/question.service.js";

export const generateTestFromImage = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    // 1. Ensure file exists
    if (!req.file) {
      throw new AppError(
        "Exam document (Image/PDF) upload karna zaroori hai",
        400,
      );
    }

    const instituteId = req.user?.instituteId;
    const createdBy = req.user?.userId;

    let extractedText = "";

    // 2. SMART CHECK: Image hai ya PDF?
    if (req.file.mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(req.file.buffer);
    } else if (req.file.mimetype.startsWith("image/")) {
      extractedText = await extractTextFromImage(req.file.buffer);
    } else {
      throw new AppError("Sirf Image (JPG/PNG) ya PDF files allowed hain", 400);
    }

    if (!extractedText || extractedText.trim() === "") {
      throw new AppError(
        "File me koi readable text nahi mila. Scanned images hain toh clear photo kheenchiye.",
        400,
      );
    }

    // 3. Generate JSON via Gemini
    const aiData = await generateMockTestJSON(extractedText);
    const questionsList = aiData.questions || [];

    if (questionsList.length === 0) {
      throw new AppError("AI koi bhi question samajh nahi paya", 400);
    }

    // 4. Save as a "Draft" Test
    const MARKS_PER_Q = 1;
    const NEGATIVE_MARKS = 0;

    const newTest = await createTest(
      {
        title: `Scanned Paper - ${new Date().toLocaleDateString("en-GB")}`,
        duration: 60,
        totalMarks: questionsList.length * MARKS_PER_Q,
        marksPerQuestion: MARKS_PER_Q,
        negativeMarking: NEGATIVE_MARKS,
        // Yahan 'status: "draft"' bhi bhej sakta hai agar tere DB model me hai toh
      },
      instituteId,
      createdBy,
    );

    // 5. Loop through AI output and save Questions (FAST PARALLEL SAVING)
    const questionPromises = questionsList.map((q: any, i: number) => {
      // 🔥 SAFETY CHECK: Agar AI ne options nahi diye toh fallback daal do
      const options = Array.isArray(q.options) && q.options.length > 0 
        ? q.options 
        : ["Option A", "Option B", "Option C", "Option D"];

      let answerIndex = options.findIndex(
        (opt: string) => opt.trim() === q.answer?.trim(),
      );
      if (answerIndex === -1) answerIndex = 0;

      // Promise return kar rahe hain (ab loop slow nahi hoga)
      return createQuestion(
        {
          testId: newTest._id.toString(),
          question: q.question || "Untitled Question",
          options: options,
          correctAnswer: answerIndex,
          difficulty: (q.difficulty?.toLowerCase() as any) || "medium",
          marks: MARKS_PER_Q,
          order: i + 1,
        },
        instituteId,
      );
    });

    // Saare questions ek jhatke me database me save! 🚀
    await Promise.all(questionPromises);

    // 6. Send Success Response
    res.status(201).json({
      success: true,
      message: "AI generated test from Document successfully!",
      data: {
        testId: newTest._id,
        totalQuestionsGenerated: questionsList.length,
      },
    });
  },
);