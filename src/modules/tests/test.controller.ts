import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

import {
  createTest,
  getTestsByInstitute,
  getSingleTest,
  updateTest,
  deleteTest,
} from "./test.service.js";

// 🔥 NAYE IMPORTS STUDENT API KE LIYE
import User from "../users/user.model.js";
import Test from "./test.model.js";
import { AppError } from "../../shared/utils/AppError.js";

// CREATE TEST
export const createTestController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    const createdBy = req.user?.userId;

    const test = await createTest(req.body, instituteId, createdBy);

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: test,
    });
  },
);

// GET ALL TESTS
export const getTestsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    const tests = await getTestsByInstitute(instituteId);

    res.json({
      success: true,
      data: tests,
    });
  },
);

// GET SINGLE TEST
export const getSingleTestController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    const test = await getSingleTest(req.params.id as string, instituteId);

    res.json({
      success: true,
      data: test,
    });
  },
);

// UPDATE TEST
export const updateTestController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    const test = await updateTest(
      req.params.id as string,
      instituteId,
      req.body,
    );

    res.json({
      success: true,
      message: "Test updated successfully",
      data: test,
    });
  },
);

// DELETE TEST
export const deleteTestController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    await deleteTest(req.params.id as string, instituteId);

    res.json({
      success: true,
      message: "Test deleted successfully",
    });
  },
);

// 🎓 ==========================================
// 🎓 GET TESTS FOR LOGGED IN STUDENT (NEW API)
// 🎓 ==========================================
export const getStudentTestsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    // 1. Find student to get their batchId
    const student = await User.findById(req.user.userId);

    // Agar student nahi mila ya usko koi batch assign nahi hai toh khali array bhejo
    if (!student || !student.batchId) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Find tests assigned to this batch which are "published"
    const tests = await Test.find({
      instituteId: req.user.instituteId,
      batchIds: { $in: [student.batchId] },
      status: "published", // Sirf published exam hi dikhenge
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tests,
    });
  },
);

// 📢 PUBLISH RESULT
export const publishResultController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { id } = req.params;
    const instituteId = req.user?.instituteId;

    const test = await Test.findOneAndUpdate(
      { _id: id, instituteId },
      { isResultPublished: true },
      { new: true }
    );

    if (!test) throw new AppError("Test not found", 404);

    res.status(200).json({
      success: true,
      message: "Results published successfully to students!",
      data: test,
    });
  }
);