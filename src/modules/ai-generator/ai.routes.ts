import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../middlewares/upload.middlewareAi.js";
import { generateTestFromImage } from "./ai.controller.js";

const router = express.Router();

// POST: /api/ai/generate
router.post(
  "/generate",
  protect,
  authorize("institute", "super-admin"), // Sirf authorized log AI use kar payenge
  uploadMiddleware.single("exam_image"),
  generateTestFromImage
);

export default router;