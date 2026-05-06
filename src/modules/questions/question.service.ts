import Question
  from "./question.model.js";

import Test
  from "../tests/test.model.js";

import { AppError }
  from "../../shared/utils/AppError.js";

type CreateQuestionPayload = {

  testId: string;

  question: string;

  options: string[];

  correctAnswer: number;

  explanation?: string;

  marks?: number;

  negativeMarks?: number;

  difficulty?:
  | "easy"
  | "medium"
  | "hard";

  subject?: string;

  topic?: string;

  order?: number;
};

// CREATE QUESTION
export const createQuestion =
  async (
    payload:
      CreateQuestionPayload,

    instituteId: string
  ) => {

    // VERIFY TEST BELONGS
    // TO INSTITUTE

    const test =
      await Test.findOne({

        _id: payload.testId,

        instituteId,
      });

    if (!test) {

      throw new AppError(
        "Test not found",
        404
      );
    }

    // VALIDATE OPTIONS

    if (
      payload.options.length < 2
    ) {

      throw new AppError(
        "Minimum 2 options required",
        400
      );
    }

    // VALIDATE ANSWER INDEX

    if (
      payload.correctAnswer <
      0 ||

      payload.correctAnswer >=
      payload.options.length
    ) {

      throw new AppError(
        "Invalid correct answer index",
        400
      );
    }

    const questionsCount =
      await Question.countDocuments({

        testId: payload.testId,
      });

    const question =
      await Question.create({

        ...payload,

        order:
          payload.order ||
          questionsCount + 1,

        instituteId,
      });

    return question;
  };

// GET QUESTIONS
// BY TEST

export const getQuestionsByTest =
  async (
    testId: string,

    instituteId: string
  ) => {

    const questions =
      await Question.find({

        testId,

        instituteId,
      })

        .sort({
          order: 1,
        });

    return questions;
  };

// GET SINGLE QUESTION

export const getSingleQuestion =
  async (
    questionId: string,

    instituteId: string
  ) => {

    const question =
      await Question.findOne({

        _id: questionId,

        instituteId,
      });

    if (!question) {

      throw new AppError(
        "Question not found",
        404
      );
    }

    return question;
  };

// UPDATE QUESTION

export const updateQuestion =
  async (
    questionId: string,

    instituteId: string,

    payload:
      Partial<CreateQuestionPayload>
  ) => {

    const question =
      await Question.findOne({

        _id: questionId,

        instituteId,
      });

    if (!question) {

      throw new AppError(
        "Question not found",
        404
      );
    }

    Object.assign(
      question,
      payload
    );

    await question.save();

    return question;
  };

// DELETE QUESTION

export const deleteQuestion =
  async (
    questionId: string,

    instituteId: string
  ) => {

    const question =
      await Question.findOne({

        _id: questionId,

        instituteId,
      });

    if (!question) {

      throw new AppError(
        "Question not found",
        404
      );
    }

    await question.deleteOne();

    return true;
  };

// GET ALL QUESTIONS
export const getAllQuestions =
  async (
    instituteId: string
  ) => {

    return await Question.find({

      instituteId,

    })

      .populate(
        "testId",
        "title"
      )

      .sort({
        createdAt: -1,
      });
  };