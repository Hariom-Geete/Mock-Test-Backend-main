import type {
  Request,
  Response
} from "express";

import {
  createTicket
} from "./support.service.js";

export const createSupportTicket =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const userId =
        (req as Request & {
          user?: any
        }).user?.userId;

      const {
        category,
        subject,
        description
      } = req.body;

      const ticket =
        await createTicket(
          userId,
          category,
          subject,
          description
        );

      res.status(201).json({
        success: true,
        message:
          "Support ticket submitted",
        data: ticket,
      });

    } catch (error: any) {


      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Something went wrong",
      });
    }
  };