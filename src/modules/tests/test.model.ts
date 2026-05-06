import mongoose, { Schema, Document } from "mongoose";

export interface ITest extends Document {
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarking: number;
  status: "draft" | "published";
  startDate?: Date;
  endDate?: Date;
  instituteId: mongoose.Types.ObjectId;
  batchIds: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isResultPublished: boolean;
}

const testSchema = new Schema<ITest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
    },

    totalMarks: { type: Number, required: true },

    marksPerQuestion: {
      // 👈 Naya field
      type: Number,
      required: true,
      default: 4,
    },

    negativeMarking: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    batchIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Baki fields ke sath isko daal de
    isResultPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Test = mongoose.model<ITest>("Test", testSchema);

export default Test;
