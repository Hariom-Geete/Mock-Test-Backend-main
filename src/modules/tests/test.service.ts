import Test from "./test.model.js";

import { AppError } from "../../shared/utils/AppError.js";

type CreateTestPayload = {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  marksPerQuestion?: number
  negativeMarking?: number;
  startDate?: Date;
  endDate?: Date;
  batchIds?: string[];
};

// CREATE TEST
export const createTest = async (
  payload: CreateTestPayload,

  instituteId: string,

  createdBy: string,
) => {
  const test = await Test.create({
    ...payload,

    instituteId,

    createdBy,
  });

  return test;
};

// GET TESTS
export const getTestsByInstitute = async (instituteId: string) => {
  const tests = await Test.find({
    instituteId,
  })

    .populate("batchIds", "name")

    .sort({
      createdAt: -1,
    });

  return tests;
};

// GET SINGLE TEST
export const getSingleTest = async (
  testId: string,

  instituteId: string,
) => {
  const test = await Test.findOne({
    _id: testId,
    instituteId,
  })

    .populate("batchIds", "name");

  if (!test) {
    throw new AppError("Test not found", 404);
  }

  return test;
};

// UPDATE TEST
export const updateTest = async (
  testId: string,
  instituteId: string,
  payload: any,
) => {
  const test = await Test.findOne({
    _id: testId,

    instituteId,
  });

  if (!test) {
    throw new AppError("Test not found", 404);
  }

  Object.assign(test, payload);

  await test.save();

  return test;
};

// DELETE TEST
export const deleteTest = async (
  testId: string,

  instituteId: string,
) => {
  const test = await Test.findOne({
    _id: testId,
    instituteId,
  });

  if (!test) {
    throw new AppError("Test not found", 404);
  }

  await test.deleteOne();

  return true;
};
