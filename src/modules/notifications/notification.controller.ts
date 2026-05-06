import type {

    Request,

    Response

} from "express";

import {

    asyncHandler

} from "../../shared/utils/asyncHandler.js";

import {

    getUserNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead

} from "./notification.service.js";

/**
 * 🚀 GET NOTIFICATIONS
 */
export const getNotificationsController =
    asyncHandler(

        async (

            req: Request & {
                user?: any
            },

            res: Response
        ) => {

            const page =
                Number(req.query.page) || 1;

            const limit =
                Number(req.query.limit) || 10;

            const data =
                await getUserNotifications(

                    req.user.userId,

                    page,

                    limit
                );

            res.status(200).json({

                success: true,

                data,
            });
        }
    );

/**
 * 🚀 MARK ONE AS READ
 */
export const markNotificationAsReadController =
    asyncHandler(

        async (

            req: Request & {
                user?: any
            },

            res: Response
        ) => {

            const data =
                await markNotificationAsRead(

                    req.params.id as string,

                    req.user.userId
                );

            res.status(200).json({

                success: true,

                data,
            });
        }
    );

/**
 * 🚀 MARK ALL AS READ
 */
export const markAllNotificationsAsReadController =
    asyncHandler(

        async (

            req: Request & {
                user?: any
            },

            res: Response
        ) => {

            const data =
                await markAllNotificationsAsRead(

                    req.user.userId
                );

            res.status(200).json({

                success: true,

                data,
            });
        }
    );