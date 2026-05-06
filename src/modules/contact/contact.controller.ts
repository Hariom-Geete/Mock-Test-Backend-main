import type {
  Request,
  Response
} from "express";

import {
  sendDemoRequest
} from "./contact.service.js";

export const demoRequestController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        name,
        email,
        institute,
        message
      } = req.body;

      await sendDemoRequest(
        name,
        email,
        institute,
        message
      );

      res.status(200).json({
        success: true,
        message:
          "Demo request submitted",
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