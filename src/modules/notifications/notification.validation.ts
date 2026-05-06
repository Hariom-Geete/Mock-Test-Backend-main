import { z } from "zod";

/**
 * 🚀 GET NOTIFICATIONS
 */
export const getNotificationsSchema =
  z.object({

    page:
      z.coerce.number()
        .min(1)
        .optional(),

    limit:
      z.coerce.number()
        .min(1)
        .max(100)
        .optional(),
  });

/**
 * 🚀 NOTIFICATION PARAM
 */
export const notificationIdSchema =
  z.object({

    id:
      z.string()
        .min(1, "Notification ID is required"),
  });