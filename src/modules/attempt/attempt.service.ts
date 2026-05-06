import ExamAttempt from "./attempt.model.js";
import Test from "../tests/test.model.js";
import Question from "../questions/question.model.js";
import { AppError } from "../../shared/utils/AppError.js";

// 🚀 1. START ATTEMPT
export const startExamAttempt = async (
  studentId: string,
  testId: string,
  instituteId: string,
) => {
  // ✅ FIND TEST
  const test = await Test.findById(testId);
  if (!test) {
    throw new AppError("Test not found", 404);
  }

  // 🚨 PREVENT MULTIPLE ACTIVE ATTEMPTS
  const existingAttempt = await ExamAttempt.findOne({
    studentId,
    testId,
    status: "in-progress",
  });

  if (existingAttempt) {
    return existingAttempt;
  }

  // ✅ COUNT QUESTIONS
  const totalQuestions = await Question.countDocuments({
    testId: test._id,
  });

  // ✅ CREATE ATTEMPT
  const attempt = await ExamAttempt.create({
    studentId,
    instituteId,
    testId,
    status: "in-progress",
    startedAt: new Date(),
    totalQuestions,
    answers: [],
  });

  return attempt;
};

// 🚀 2. SUBMIT ATTEMPT & EVALUATE
export const submitExamAttempt = async (
  attemptId: string,
  studentId: string,
  answersArray: { questionId: string; selectedAnswer: number | null }[], // ✅ Added null here
  frontendAutoSubmit: boolean = false, // ✅ Fixed parameter name
) => {
  const attempt = await ExamAttempt.findOne({ _id: attemptId, studentId });
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.status === "submitted")
    throw new AppError("Exam already submitted", 400);

  const test = await Test.findById(attempt.testId);
  if (!test) throw new AppError("Test not found", 404);

  // ── 1. STRICT TIME VALIDATION (Server Side) ──
  const allowedTimeMs = test.duration * 60 * 1000;
  const timeElapsedMs = new Date().getTime() - attempt.startedAt.getTime();
  const timeSpentMins = Math.floor(timeElapsedMs / 60000);

  let isAutoSubmit = frontendAutoSubmit; // ✅ Logic fixed

  // Give a 2-minute buffer for network latency
  if (timeElapsedMs > allowedTimeMs + 120000) {
    isAutoSubmit = true; // Force auto-submit format if student tries to trick timer
  }

  // ── 2. MANDATORY QUESTION CHECK ──
  if (!isAutoSubmit) {
    const attemptedQuestions = answersArray.filter(
      (ans) => ans.selectedAnswer !== null && ans.selectedAnswer !== undefined,
    ).length;
    if (attemptedQuestions < attempt.totalQuestions) {
      throw new AppError(
        `You must attempt all ${attempt.totalQuestions} questions. You only answered ${attemptedQuestions}.`,
        400,
      );
    }
  }

  // ── 3. SCORING ENGINE ──
  let correctCount = 0;
  let wrongCount = 0;
  let totalScore = 0;

  const allQuestions = await Question.find({ testId: test._id });
  const questionMap = new Map(allQuestions.map((q) => [q._id.toString(), q]));

  const evaluatedAnswers = answersArray.map((ans) => {
    const qDetails = questionMap.get(ans.questionId.toString());
    let isCorrect = false;
    let marksObtained = 0;

    if (
      qDetails &&
      ans.selectedAnswer !== null &&
      ans.selectedAnswer !== undefined
    ) {
      if (qDetails.correctAnswer === ans.selectedAnswer) {
        isCorrect = true;
        // Handling dynamic marking if standard marks missing
        marksObtained = (test.totalMarks / attempt.totalQuestions) || 4;
        correctCount++;
      } else {
        marksObtained = 0; // If you have negative marks, do: -(test.negativeMarks || 0)
        wrongCount++;
      }
      totalScore += marksObtained;
    }

    return {
      questionId: ans.questionId,
      selectedAnswer: ans.selectedAnswer ?? null, // Safely fallback to null
      isCorrect,
      marksObtained,
    };
  });

  // Calculate Percentage
  const maxPossibleMarks = test.totalMarks || attempt.totalQuestions * 4;
  const percentage =
    maxPossibleMarks > 0
      ? Math.max(0, Math.round((totalScore / maxPossibleMarks) * 100))
      : 0;

  // ── 4. SAVE FINAL RESULT ──
  attempt.answers = evaluatedAnswers as any;
  attempt.correctAnswers = correctCount;
  attempt.wrongAnswers = wrongCount;
  attempt.unanswered = attempt.totalQuestions - (correctCount + wrongCount);
  attempt.score = totalScore;
  attempt.percentage = percentage;
  attempt.timeSpent = Math.min(timeSpentMins, test.duration); // Cap time spent
  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  attempt.isAutoSubmitted = isAutoSubmit;

  await attempt.save();

  return attempt;
};

// 🚨 3. LOG WARNING SERVICE (ANTI-CHEAT)
export const logCheatWarning = async (
  attemptId: string,
  studentId: string,
  warningType: string,
) => {
  const attempt = await ExamAttempt.findOne({ _id: attemptId, studentId });
  // Prevent logging warnings after exam is already submitted
  if (!attempt || attempt.status === "submitted") return 0;

  attempt.warnings.push({ type: warningType, time: new Date() } as any);
  attempt.warningCount += 1;
  await attempt.save();

  return attempt.warningCount;
};
