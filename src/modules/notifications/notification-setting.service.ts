import NotificationSetting
from "./notification-setting.model.js";

/**
 * 🚀 GET SETTINGS
 */
export const getNotificationSettings =
async (
  userId: string
) => {

  let settings =
    await NotificationSetting.findOne({

      userId,
    });

  // ✅ AUTO CREATE
  if (!settings) {

    settings =
      await NotificationSetting.create({

        userId,
      });
  }

  return settings;
};

/**
 * 🚀 UPDATE SETTINGS
 */
export const updateNotificationSettings =
async (

  userId: string,

  data: any
) => {

  const settings =
    await NotificationSetting.findOneAndUpdate(

      {
        userId,
      },

      data,

      {
        new: true,
        upsert: true,
      }
    );

  return settings;
};