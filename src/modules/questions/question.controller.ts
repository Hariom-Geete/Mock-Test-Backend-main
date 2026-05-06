import type {
  Request,
  Response,
} from "express";

import { asyncHandler }
from "../../shared/utils/asyncHandler.js";

import {
  createQuestion,
  getQuestionsByTest,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestions,
} from "./question.service.js";

// CREATE QUESTION
export const createQuestionController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    const question =
      await createQuestion(
        req.body,
        instituteId
      );

    res.status(201).json({
      success: true,

      message:
        "Question created successfully",

      data: question,
    });
  }
);

// GET QUESTIONS
// BY TEST

export const getQuestionsController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    const testId =
      req.params.testId as string;

    const questions =
      await getQuestionsByTest(
        testId,
        instituteId
      );

    res.json({
      success: true,
      data: questions,
    });
  }
);

// GET SINGLE QUESTION

export const getSingleQuestionController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    const question =
      await getSingleQuestion(
        req.params.id as string,
        instituteId
      );

    res.json({
      success: true,
      data: question,
    });
  }
);

// UPDATE QUESTION

export const updateQuestionController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    const question =
      await updateQuestion(
        req.params.id as string,

        instituteId,

        req.body
      );

    res.json({
      success: true,

      message:
        "Question updated successfully",

      data: question,
    });
  }
);

// DELETE QUESTION

export const deleteQuestionController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    await deleteQuestion(
      req.params.id as string,
      instituteId
    );

    res.json({
      success: true,

      message:
        "Question deleted successfully",
    });
  }
);

// GET ALL QUESTIONS
export const getAllQuestionsController =
asyncHandler(
  async (
    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const instituteId =
      req.user?.instituteId;

    const questions =
      await getAllQuestions(
        instituteId
      );

    res.json({
      success: true,
      data: questions,
    });
  }
);