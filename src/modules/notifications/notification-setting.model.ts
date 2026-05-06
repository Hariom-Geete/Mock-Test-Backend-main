import mongoose, {
  Schema,
  Document
} from "mongoose";

export interface INotificationSetting
extends Document {

  userId:
    mongoose.Types.ObjectId;

  examCompleted:
    boolean;

  newStudentEnrollment:
    boolean;

  weeklyAnalytics:
    boolean;

  securityAlerts:
    boolean;
}

const notificationSettingSchema =
new Schema<INotificationSetting>(

  {

    userId: {

      type:
        Schema.Types.ObjectId,

      ref:
        "User",

      required:
        true,

      unique:
        true,
    },

    examCompleted: {

      type:
        Boolean,

      default:
        true,
    },

    newStudentEnrollment: {

      type:
        Boolean,

      default:
        true,
    },

    weeklyAnalytics: {

      type:
        Boolean,

      default:
        true,
    },

    securityAlerts: {

      type:
        Boolean,

      default:
        true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(

  "NotificationSetting",

  notificationSettingSchema
);