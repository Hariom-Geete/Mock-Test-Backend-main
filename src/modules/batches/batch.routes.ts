import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createBatchController,
  getBatchesController,
} from "./batch.controller.js";
import { createBatchSchema } from "./batch.validation.js";
import { requireActiveSubscription } from "../../middlewares/subscription.middleware.js";

const router = express.Router();

// 👨‍🏫 Only institute can manage batches
router.post(
  "/",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  validate(createBatchSchema),
  createBatchController
);

router.get(
  "/",
  protect,
  authorize("institute"),
  getBatchesController
);

export default router;