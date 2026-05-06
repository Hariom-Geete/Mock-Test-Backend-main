import type {
  Request,
  Response
} from "express";

import {
  asyncHandler
} from "../../shared/utils/asyncHandler.js";

import {

  getNotificationSettings,

  updateNotificationSettings

} from "./notification-setting.service.js";

/**
 * 🚀 GET SETTINGS
 */
export const getNotificationSettingsController =
asyncHandler(

  async (

    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const settings =
      await getNotificationSettings(

        req.user.userId
      );

    res.status(200).json({

      success: true,

      data: settings,
    });
  }
);

/**
 * 🚀 UPDATE SETTINGS
 */
export const updateNotificationSettingsController =
asyncHandler(

  async (

    req: Request & {
      user?: any
    },

    res: Response
  ) => {

    const settings =
      await updateNotificationSettings(

        req.user.userId,

        req.body
      );

    res.status(200).json({

      success: true,

      data: settings,
    });
  }
);