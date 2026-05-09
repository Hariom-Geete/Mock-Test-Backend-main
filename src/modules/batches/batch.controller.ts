import type {
  Request,
  Response,
} from "express";

import Batch from "./batch.model.js";

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
      const instituteId =
        req.user?.instituteId;

      const batch =
        await createBatch(
          req.body,
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

export const getSingleBatchController =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {
      const batch =
        await Batch.findOne({
          _id: req.params.id,
          instituteId:
            req.user?.instituteId,
        });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      res.status(200).json({
        success: true,
        data: batch,
      });
    }
  );

export const updateBatchController =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {
      const updatedBatch =
        await Batch.findOneAndUpdate(
          {
            _id: req.params.id,
            instituteId:
              req.user?.instituteId,
          },
          req.body,
          {
            new: true,
          }
        );

      if (!updatedBatch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Batch updated successfully",
        data: updatedBatch,
      });
    }
  );

export const deleteBatchController =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {
      const deletedBatch =
        await Batch.findOneAndDelete({
          _id: req.params.id,
          instituteId:
            req.user?.instituteId,
        });

      if (!deletedBatch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Batch deleted successfully",
      });
    }
  );