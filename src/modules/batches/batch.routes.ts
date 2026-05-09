import express from "express";

import {
  protect,
  authorize,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.js";

import {
  createBatchController,
  getBatchesController,
  getSingleBatchController,
  updateBatchController,
  deleteBatchController,
} from "./batch.controller.js";

import {
  createBatchSchema,
  updateBatchSchema,
} from "./batch.validation.js";

import { requireActiveSubscription } from "../../middlewares/subscription.middleware.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  validate(createBatchSchema),
  createBatchController
);

// GET ALL
router.get(
  "/",
  protect,
  authorize("institute"),
  getBatchesController
);

// GET SINGLE
router.get(
  "/:id",
  protect,
  authorize("institute"),
  getSingleBatchController
);

// UPDATE
router.put(
  "/:id",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  validate(updateBatchSchema),
  updateBatchController
);

// DELETE
router.delete(
  "/:id",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  deleteBatchController
);

export default router;