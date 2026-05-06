import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedAnswer: number | null;
  isCorrect: boolean;
  marksObtained: number;
}

export interface IExamAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  instituteId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  status: "in-progress" | "submitted";
  startedAt: Date;
  submittedAt?: Date;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeSpent: number;
  // src/modules/attempt/attempt.model.ts me ye naye fields add kar de:
  warnings: { type: string; time: Date }[];
  warningCount: number;
  isAutoSubmitted: boolean;
}

const answerSchema = new Schema<IAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  selectedAnswer: {
    type: Number,
    default: null,
  },

  isCorrect: {
    type: Boolean,
    default: false,
  },

  marksObtained: {
    type: Number,
    default: 0,
  },
});

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
      index: true,
    },

    answers: [answerSchema],

    status: {
      type: String,
      enum: ["in-progress", "submitted"],
      default: "in-progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    submittedAt: Date,

    totalQuestions: {
      type: Number,
      default: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    wrongAnswers: {
      type: Number,
      default: 0,
    },

    unanswered: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    timeSpent: { type: Number, default: 0 },

    // 🔥 NEW: Anti-Cheat Schema definition
    warnings: [
      {
        type: { type: String }, // e.g., "tab_switch", "screenshot_attempt"
        time: { type: Date, default: Date.now },
      },
    ],
    warningCount: { type: Number, default: 0 },
    isAutoSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🚀 IMPORTANT INDEX
examAttemptSchema.index({ studentId: 1, testId: 1 });

const ExamAttempt = mongoose.model<IExamAttempt>(
  "ExamAttempt",
  examAttemptSchema,
);

export default ExamAttempt;
