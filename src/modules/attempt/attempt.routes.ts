import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";

import {
  startAttemptController,
  submitAttemptController,
  logWarningController, // ✅ Naam theek kar diya
  getMyAttemptsController,
  getTestAttemptsController,
} from "./attempt.controller.js";

import { startAttemptSchema } from "./attempt.validation.js";
import { validate } from "../../middlewares/validate.js";

const router = express.Router();

// 🚀 START EXAM (With Schema Validation - Excellent job keeping this! 👏)
router.post(
  "/start/:testId",
  protect,
  authorize("student"),
  validate(startAttemptSchema),
  startAttemptController,
);

// 📝 SUBMIT EXAM
router.post(
  "/submit/:attemptId",
  protect,
  authorize("student"),
  submitAttemptController,
);

// 🚨 ANTI-CHEAT LOGGING
router.post(
  "/warning/:attemptId",
  protect,
  authorize("student"),
  logWarningController, // ✅ Correct controller name
);

// Student ke apne attempts dekhne ka route
router.get(
  "/my-attempts",
  protect,
  authorize("student"),
  getMyAttemptsController,
);

// Institute route for Leaderboard
router.get(
  "/test/:testId",
  protect,
  authorize("institute"),
  getTestAttemptsController,
);

export default router;
