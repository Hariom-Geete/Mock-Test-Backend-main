import { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import User from "../users/user.model.js";

// 📊 1. GET SUPER ADMIN DASHBOARD STATS (Revenue, Total Institutes, etc.)
export const getSuperAdminStatsController = asyncHandler(async (req: Request, res: Response) => {
  // Total Students across platform
  const totalStudents = await User.countDocuments({ role: "student" });
  
  // Total Institutes
  const totalInstitutes = await User.countDocuments({ role: "institute" });

  // 💰 Total Revenue (Sabhi institutes ka totalPaid sum karna)
  const revenueAgg = await User.aggregate([
    { $match: { role: "institute" } },
    { $group: { _id: null, totalRevenue: { $sum: "$subscription.totalPaid" } } }
  ]);
  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      totalInstitutes,
      totalRevenue
    }
  });
});

// 🏢 2. GET ALL INSTITUTES WITH EXACT STUDENT COUNT
export const getAllInstitutesController = asyncHandler(async (req: Request, res: Response) => {
  const institutes = await User.aggregate([
    // 1. Sirf unko pakdo jo institute hain
    { $match: { role: "institute" } },
    
    // 2. Simple Lookup: Unke saare users utha lo (student, teacher jo bhi ho)
    { 
      $lookup: { 
        from: "users", 
        localField: "_id", 
        foreignField: "instituteId", 
        as: "all_associated_users" 
      }
    },
    
    // 3. Array ko filter karo: Sirf 'student' role walo ko rakho
    {
      $addFields: {
        studentsOnly: {
          $filter: {
            input: "$all_associated_users",
            as: "user",
            cond: { $eq: ["$$user.role", "student"] }
          }
        }
      }
    },
    
    // 4. Un filtered students ki ginti (size) nikal lo
    { $addFields: { studentCount: { $size: "$studentsOnly" } } },
    
    // 5. Safai: Heavy arrays aur password ko hide kar do taaki API fast rahe
    { $project: { password: 0, all_associated_users: 0, studentsOnly: 0 } },
    
    // 6. Naye institutes upar dikhenge
    { $sort: { createdAt: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: institutes
  });
});

// ⚡ 3. ACTIVATE / RENEW SUBSCRIPTION (Manual Payment Flow)
export const activateSubscriptionController = asyncHandler(async (req: Request, res: Response) => {
  const { instituteId } = req.params;
  const { planName, monthsValid, amountPaid } = req.body; // e.g. { planName: "6 Months", monthsValid: 6, amountPaid: 5000 }

  const institute = await User.findById(instituteId);
  if (!institute) throw new Error("Institute not found");

  // Calculate new end date
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + monthsValid); // Add months

  // Update subscription & Add to Total Revenue
  const updatedInstitute = await User.findByIdAndUpdate(
    instituteId,
    {
      $set: {
        "subscription.planName": planName,
        "subscription.startDate": startDate,
        "subscription.endDate": endDate,
        "subscription.status": "active"
      },
      // Previous total revenue + Naya amount jo abhi cash/UPI me liya
      $inc: { "subscription.totalPaid": amountPaid } 
    },
    { new: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: `Subscription activated for ${monthsValid} months!`,
    data: updatedInstitute
  });
});

// 🎓 GET ALL STUDENTS (SUPER ADMIN ONLY)
export const getAllStudentsAdminController = asyncHandler(async (req: Request, res: Response) => {
  // Bina kisi institute filter ke saare 'student' role wale users utha lo
  const students = await User.find({ role: "student" })
    .populate("instituteId", "name email") // Institute ka naam bhi chahiye table ke liye
    .sort({ createdAt: -1 })
    .select("-password"); // Password hide kar do

  res.status(200).json({
    success: true,
    data: students
  });
});