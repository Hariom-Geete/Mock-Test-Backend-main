//  # Links to Institute (e.g., 'Target 2026')
import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  name: string;
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

    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute", // 🔥 FIX: Ye pehle "User" tha, isko "Institute" karna hai
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 prevent duplicate batch names inside same institute
batchSchema.index({ instituteId: 1, name: 1 }, { unique: true });

const Batch = mongoose.model<IBatch>("Batch", batchSchema);

export default Batch;