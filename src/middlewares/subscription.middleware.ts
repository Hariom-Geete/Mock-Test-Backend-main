import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../shared/utils/asyncHandler.js";
import User from "../modules/users/user.model.js"; 

export const requireActiveSubscription = asyncHandler(
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    
    // 1. Agar user login hi nahi hai (Security check)
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2. 💡 FRESH DATA: Token ke data pe bharosa mat karo, DB se fresh status nikalo
    const freshUser = await User.findById(req.user._id);

    // Agar institute hai toh check karo, Super Admin/Student ke liye bypass kar do
    if (freshUser && freshUser.role === "institute") {
      const sub = freshUser.subscription;

      // 🚨 STATUS CHECK: Agar active nahi hai
      if (!sub || sub.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "🚫 Your subscription is inactive. Please complete payment.",
          code: "SUBSCRIPTION_REQUIRED"
        });
      }

      // 🚨 DATE CHECK: Mobile Recharge Logic
      if (sub.endDate) {
        const today = new Date();
        const expiryDate = new Date(sub.endDate);

        if (today > expiryDate) {
          // Expiry hone par DB me status update kar do
          await User.findByIdAndUpdate(freshUser._id, { 
            $set: { "subscription.status": "expired" } 
          });

          return res.status(403).json({
            success: false,
            message: "⏳ Your subscription has EXPIRED! Please renew.",
            code: "SUBSCRIPTION_EXPIRED"
          });
        }
      }
    }
    
    // Sab sahi hai, toh aage badho
    next();
  }
);