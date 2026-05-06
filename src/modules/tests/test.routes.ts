import express from "express";

import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";

import {
  createTestController,
  getTestsController,
  getSingleTestController,
  updateTestController,
  deleteTestController,
  getStudentTestsController,
  publishResultController,
} from "./test.controller.js";

import { createTestSchema, updateTestSchema } from "./test.validation.js";
import { requireActiveSubscription } from "../../middlewares/subscription.middleware.js";

const router = express.Router();

// ==========================================
// CREATE TEST
// ==========================================
router.post(
  "/",
  protect,
  authorize("institute"),
  requireActiveSubscription, 
  validate(createTestSchema),
  createTestController,
);

// ==========================================
// GET ALL TESTS
// ==========================================
router.get("/", protect, authorize("institute"), getTestsController);

// ==========================================
// 🎓 STUDENT - GET MY TESTS
// (/:id se pehle hona chahiye)
// ==========================================
router.get(
  "/student/my-tests",
  protect,
  authorize("student"),
  getStudentTestsController,
);

// ==========================================
// GET SINGLE TEST
// ==========================================
router.get(
  "/:id",
  protect,
  authorize("institute", "student"),
  getSingleTestController,
);

// ==========================================
// UPDATE TEST
// ==========================================
router.patch(
  "/:id",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  validate(updateTestSchema),
  updateTestController,
);

// ==========================================
// DELETE TEST
// ==========================================
router.delete("/:id", protect, authorize("institute"), deleteTestController);

// Institute route to publish result
router.patch(
  "/:id/publish-result",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  publishResultController,
);

export default router;
