import Test from "./test.model.js";
import mongoose from "mongoose";
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
  // 🔥 SMART DUPLICATE HANDLER: Error mat do, name change kar do!
  let finalTitle = payload.title;
  let existingTest = await Test.findOne({ title: finalTitle, instituteId });
  let counter = 1;

  while (existingTest) {
    finalTitle = `${payload.title} (${counter})`; // e.g. "JEE Mock (1)"
    existingTest = await Test.findOne({ title: finalTitle, instituteId });
    counter++;
  }

  const test = await Test.create({
    ...payload,
    title: finalTitle, // Naya unique name
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
  const test = await Test.findOne({ _id: testId, instituteId });

  if (!test) throw new AppError("Test not found", 404);

  // 1. Duplicate Name Check
  if (payload.title && payload.title !== test.title) {
    const existingTest = await Test.findOne({ title: payload.title, instituteId });
    if (existingTest) throw new AppError("Another exam with this title already exists!", 400);
  }

  // 2. Normal Update
  Object.assign(test, payload);

  // 3. 🔥 THE MAGIC: Agar marks change huye hain, toh sab update karo
  if (payload.marksPerQuestion !== undefined || payload.negativeMarking !== undefined) {
    const updateData: any = {};
    if (payload.marksPerQuestion !== undefined) updateData.marks = payload.marksPerQuestion;
    if (payload.negativeMarking !== undefined) updateData.negativeMarks = payload.negativeMarking;

    // A. Saare questions ko ek sath update karo
    await mongoose.model('Question').updateMany(
      { testId: testId },
      { $set: updateData }
    );

    // B. Total Marks automatically calculate karke Test me save kar do!
    if (payload.marksPerQuestion !== undefined) {
       const questionCount = await mongoose.model('Question').countDocuments({ testId: testId });
       test.totalMarks = questionCount * payload.marksPerQuestion; 
    }
  }

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
