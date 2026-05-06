import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  userAgent?: string;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  token: {
    type: String,
    required: true,
  },

  userAgent: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // ⏱️ 24h TTL
  },
});

export const Session = mongoose.model<ISession>("Session", sessionSchema);