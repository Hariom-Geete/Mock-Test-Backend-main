import express from "express";

import {
  protect,
  authorize
} from "../../middlewares/auth.middleware.js";

import {

  getNotificationSettingsController,

  updateNotificationSettingsController

} from "./notification-setting.controller.js";

const router =
express.Router();

/**
 * 🚀 GET SETTINGS
 */
router.get(

  "/",

  protect,

  authorize(
    "student",
    "institute",
    "super-admin"
  ),

  getNotificationSettingsController
);

/**
 * 🚀 UPDATE SETTINGS
 */
router.patch(

  "/",

  protect,

  authorize(
    "student",
    "institute",
    "super-admin"
  ),

  updateNotificationSettingsController
);

export default router;