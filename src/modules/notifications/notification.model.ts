import mongoose,
{
  Schema,
  Document
}
from "mongoose";

export interface INotification
extends Document {

  userId:
    mongoose.Types.ObjectId;

  title:
    string;

  message:
    string;

  type:
    | "exam"
    | "result"
    | "system"
    | "security";

  isRead:
    boolean;

  link?:
    string;
}

const notificationSchema =
new Schema<INotification>(
{

  userId: {

    type:
      Schema.Types.ObjectId,

    ref:
      "User",

    required:
      true,

    index:
      true,
  },

  title: {

    type:
      String,

    required:
      true,
  },

  message: {

    type:
      String,

    required:
      true,
  },

  type: {

    type:
      String,

    enum: [
      "exam",
      "result",
      "system",
      "security"
    ],

    default:
      "system",
  },

  isRead: {

    type:
      Boolean,

    default:
      false,
  },

  link: {
    type:
      String,
  },
},
{
  timestamps: true,
}
);

// 🚀 IMPORTANT INDEXES
notificationSchema.index({

  userId: 1,

  isRead: 1,

  createdAt: -1,
});

const Notification =
mongoose.model<INotification>(

  "Notification",

  notificationSchema
);

export default Notification;