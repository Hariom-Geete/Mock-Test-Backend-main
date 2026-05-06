import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IQuestion
extends Document {

  testId:
    mongoose.Types.ObjectId;

  instituteId:
    mongoose.Types.ObjectId;

  question: string;

  options: string[];

  correctAnswer: number;

  explanation?: string;

  marks: number;

  negativeMarks: number;

  type:
    | "single-choice";

  difficulty:
    | "easy"
    | "medium"
    | "hard";

  subject?: string;

  topic?: string;

  order: number;
}

const questionSchema =
new Schema<IQuestion>(
  {
    testId: {
      type:
        Schema.Types.ObjectId,

      ref: "Test",

      required: true,
    },

    instituteId: {
      type:
        Schema.Types.ObjectId,

      ref: "Institute",

      required: true,
    },

    question: {
      type: String,

      required: true,

      trim: true,
    },

    options: [
      {
        type: String,

        required: true,
      },
    ],

    correctAnswer: {
      type: Number,

      required: true,
    },

    explanation: {
      type: String,

      default: "",
    },

    marks: {
      type: Number,

      default: 1,
    },

    negativeMarks: {
      type: Number,

      default: 0,
    },

    type: {
      type: String,

      enum: [
        "single-choice",
      ],

      default:
        "single-choice",
    },

    difficulty: {
      type: String,

      enum: [
        "easy",
        "medium",
        "hard",
      ],

      default: "medium",
    },

    subject: {
      type: String,
    },

    topic: {
      type: String,
    },

    order: {
      type: Number,

      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Question =
mongoose.model<IQuestion>(
  "Question",
  questionSchema
);

export default Question;