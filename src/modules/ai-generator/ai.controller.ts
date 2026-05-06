import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { AppError } from "../../shared/utils/AppError.js";
import { extractTextFromImage, generateMockTestJSON } from "./ai.service.js";
import { createTest } from "../tests/test.service.js";
import { createQuestion } from "../questions/question.service.js";

export const generateTestFromImage = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    
    // 1. Ensure file exists
    if (!req.file) {
      throw new AppError("Exam image upload karna zaroori hai", 400);
    }

    const instituteId = req.user?.instituteId;
    const createdBy = req.user?.userId;

    // 2. Extract Text via OCR
    const extractedText = await extractTextFromImage(req.file.buffer);
    if (!extractedText || extractedText.trim() === "") {
        throw new AppError("Image me koi readable text nahi mila", 400);
    }

    // 3. Generate JSON via Gemini
    const aiData = await generateMockTestJSON(extractedText);
    const questionsList = aiData.questions || [];

    if (questionsList.length === 0) {
        throw new AppError("AI koi bhi question samajh nahi paya", 400);
    }

    // 4. Save as a "Draft" Test using your existing service
    // 4. Save as a "Draft" Test using your existing service
    const newTest = await createTest({
      title: `AI Generated Exam - ${new Date().toLocaleDateString()}`,
      duration: 60, 
      totalMarks: questionsList.length, 
      // status: "draft"  <--- YE LINE HATA DE
    }, instituteId, createdBy);

    // 5. Loop through AI output and save Questions using your existing service
    for (let i = 0; i < questionsList.length; i++) {
        const q = questionsList[i];
        
        // Find correct answer index (AI gives string, your DB needs index 0,1,2,3)
        let answerIndex = q.options.findIndex((opt: string) => opt.trim() === q.answer?.trim());
        if (answerIndex === -1) answerIndex = 0; // Default to 0 if answer is empty/wrong

        await createQuestion({
            testId: newTest._id.toString(),
            question: q.question,
            options: q.options,
            correctAnswer: answerIndex,
            difficulty: q.difficulty?.toLowerCase() as any || "medium",
            marks: 1,
            order: i + 1
        }, instituteId);
    }

    // 6. Send Success Response
    res.status(201).json({
      success: true,
      message: "AI generated test and saved as draft successfully!",
      data: {
        testId: newTest._id,
        totalQuestionsGenerated: questionsList.length
      }
    });
  }
);