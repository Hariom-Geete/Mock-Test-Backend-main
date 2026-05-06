import type { Request, Response } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler.js";

import {
  logCheatWarning,
  startExamAttempt,
  submitExamAttempt,
} from "./attempt.service.js";
import ExamAttempt from "./attempt.model.js"; 

export const startAttemptController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { testId } = req.params;

    const attempt = await startExamAttempt(
      req.user.userId,
      testId as string,
      req.user.instituteId,
    );

    res.status(201).json({
      success: true,
      message: "Exam started successfully",
      data: attempt,
    });
  },
);

export const submitAttemptController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const attemptId = req.params.attemptId as string;
    const { answers, isAutoSubmit } = req.body;

    const result = await submitExamAttempt(
      attemptId,
      req.user.userId,
      answers,
      isAutoSubmit,
    );

    res.status(200).json({
      success: true,
      message: "Exam submitted successfully",
      data: result,
    });
  },
);

// 🚨 LOG WARNING
export const logWarningController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const attemptId = req.params.attemptId as string;
    const { type } = req.body; // e.g., "tab_switch"

    const count = await logCheatWarning(attemptId, req.user.userId, type);

    res.status(200).json({
      success: true,
      warningCount: count,
    });
  },
);

// 📊 GET LOGGED IN STUDENT'S ATTEMPTS
export const getMyAttemptsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    // Student ke saare attempts nikalo aur test ki details (title, marks) bhi sath le aao
    const attempts = await ExamAttempt.find({ studentId: req.user.userId })
      .populate("testId", "title totalMarks duration status endDate")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attempts,
    });
  }
);

// 🏆 GET ALL ATTEMPTS FOR A TEST (INSTITUTE LEADERBOARD)
export const getTestAttemptsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { testId } = req.params;

    // Fetch all attempts for this test, sort by highest score first, then least time taken
    const attempts = await ExamAttempt.find({ testId, instituteId: req.user.instituteId })
      .populate("studentId", "name email username profileImage")
      .sort({ score: -1, timeSpent: 1 });

    res.status(200).json({
      success: true,
      data: attempts,
    });
  }
);