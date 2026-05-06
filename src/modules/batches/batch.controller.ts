import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createBatch,
  getBatchesByInstitute,
} from "./batch.service.js";
export const createBatchController =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {

      const { name } = req.body;

      const instituteId =
        req.user?.instituteId;

      const batch =
        await createBatch(
          name,
          instituteId
        );

      res.status(201).json({
        success: true,
        message:
          "Batch created successfully",
        data: batch,
      });
    }
  );

export const getBatchesController =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {

      const instituteId =
        req.user?.instituteId;

      const batches =
        await getBatchesByInstitute(
          instituteId
        );

      res.json({
        success: true,
        data: batches,
      });
    }
  );