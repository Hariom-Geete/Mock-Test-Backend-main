import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: "active" | "inactive";
  instituteId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

batchSchema.index(
  { instituteId: 1, name: 1 },
  { unique: true }
);

const Batch = mongoose.model<IBatch>(
  "Batch",
  batchSchema
);

export default Batch;