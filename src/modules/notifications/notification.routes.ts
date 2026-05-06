import express from "express";

import {
  protect,
  authorize
} from "../../middlewares/auth.middleware.js";

import {
  validate
} from "../../middlewares/validate.js";

import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController
} from "./notification.controller.js";

import {
  getNotificationsSchema,
  notificationIdSchema
} from "./notification.validation.js";

const router = express.Router();

/**
 * 🚀 GET NOTIFICATIONS
 */
router.get(
  "/",
  protect,
  authorize(
    "student",
    "institute",
    "super-admin"
  ),
  validate(getNotificationsSchema),
  getNotificationsController
);

/**
 * 🚀 MARK SINGLE AS READ
 */
router.patch(
  "/:id/read",
  protect,
  authorize(
    "student",
    "institute",
    "super-admin"
  ),
  validate(notificationIdSchema),
  markNotificationAsReadController
);

/**
 * 🚀 MARK ALL AS READ
 */
router.patch(
  "/read-all",
  protect,
  authorize(
    "student",
    "institute",
    "super-admin"
  ),

  // ❌ NO VALIDATION NEEDED HERE

  markAllNotificationsAsReadController
);

export default router;