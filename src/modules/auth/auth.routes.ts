// Baki imports ke neeche ye add kar de
import { upload } from "../../middlewares/upload.middleware.js";
import express from "express";
import {
  registerInstitute,
  login,
  logout,
  resetPasswordController,
  changePasswordController,
  setupSuperAdminController,
} from "./auth.controller.js";
import { protect, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import { authLimiter } from "../../middlewares/rateLimiter.js";
import { forgotPasswordController } from "./auth.controller.js";
import { forgotPasswordSchema } from "./auth.validation.js";
import User from "../users/user.model.js";

const router = express.Router();

// 🔓 PUBLIC
router.post("/register-institute", validate(registerSchema), registerInstitute);

router.post("/login", authLimiter, validate(loginSchema), login);

// 🔐 AUTHENTICATED (ALL ROLES)
router.post(
  "/logout",
  protect,
  authorize("institute", "student", "super-admin"),
  logout,
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPasswordController,
);

router.post(
  "/change-password",

  protect,

  authorize("student", "institute", "super-admin"),

  changePasswordController,
);
router.get(
  "/profile",
  protect,
  authorize("institute", "student", "super-admin"),
  async (req: any, res) => {
    const user = await User.findById(req.user.userId).select("-password");

    res.json({
      success: true,
      data: user,
    });
  },
);

router.patch(
  "/profile",
  protect,
  authorize("institute", "student", "super-admin"),
  upload.single("profileImage"), // 📸 1. MULTER MIDDLEWARE (Image capture karega)
  async (req: any, res) => {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Update Text Data
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    // 📸 3. CLOUDINARY IMAGE LOGIC
    // Agar frontend se file aayi hai, toh upload.middleware usko Cloudinary pe daal dega 
    // aur uska secure URL req.file.path me de dega.
    if (req.file && req.file.path) {
      // NOTE: Agar tere User schema me photo ka naam 'avatar' hai toh user.avatar = req.file.path karna.
      user.profileImage = req.file.path; 
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully 🚀",
      data: user, // 👈 Ye fresh data (with image URL) frontend ko wapas chala jayega
    });
  },
);

// 🔒 SUPER ADMIN ONLY
router.get("/admin", protect, authorize("super-admin"), (_req, res) => {
  res.json({ success: true });
});

// Hidden route (Kahin frontend pe iska button mat dena)
router.post("/setup-super-admin", setupSuperAdminController);

export default router;
