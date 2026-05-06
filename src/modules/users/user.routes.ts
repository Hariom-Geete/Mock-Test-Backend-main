import { upload } from "../../middlewares/upload.middleware.js";
import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { createStudentSchema } from "./user.validation.js";
import { createStudentController, deleteStudentController, getStudentsController, importStudentsController, updateProfile, updateStudentController } from "./user.controller.js";
import User from "./user.model.js";
import { requireActiveSubscription } from "../../middlewares/subscription.middleware.js";

const router = express.Router();

// 👨‍🏫 Institute creates student
router.post(
  "/create-student",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  validate(createStudentSchema),
  createStudentController
);

router.delete(
  "/students/:id",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  deleteStudentController
);

router.patch(
  "/students/:id",
  protect,
  authorize("institute"),
  requireActiveSubscription,
  updateStudentController
);

router.post(
  "/students/import",

  protect,

  authorize("institute"),
  requireActiveSubscription,

  upload.single("file"),

  importStudentsController
);

router.get(
  "/students",
  protect,
  authorize("institute"),
  getStudentsController
);

export default router;