import express from "express";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { 
  getSuperAdminStatsController, 
  getAllInstitutesController, 
  activateSubscriptionController, 
  getAllStudentsAdminController
} from "./superadmin.controller.js";

const router = express.Router();

// Sirf 'super-admin' in APIs ko touch kar sakta hai
router.use(protect, authorize("super-admin"));

router.get("/stats", getSuperAdminStatsController);
router.get("/institutes", getAllInstitutesController);
router.patch("/institute/:instituteId/activate", activateSubscriptionController);
router.get("/students", getAllStudentsAdminController);

export default router;