import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import {
  getInstituteAnalyticsController,
  getMyInstitute,
  updateInstitute,
} from "./institute.controller.js";

const router = express.Router();

router.get("/me", protect, authorize("institute"), getMyInstitute);

router.patch("/me", protect, authorize("institute"), updateInstitute);

router.get(
  "/analytics",
  protect,
  authorize("institute"),
  getInstituteAnalyticsController,
);

export default router;
