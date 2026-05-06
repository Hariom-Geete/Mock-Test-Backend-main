import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import Institute from "./institute.model.js";
import mongoose from "mongoose";
import User from "../users/user.model.js";
import Test from "../tests/test.model.js";
import Batch from "../batches/batch.model.js";
import ExamAttempt from "../attempt/attempt.model.js";

export const getMyInstitute =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {

      const institute =
        await Institute.findOne({
          ownerId: req.user.userId,
        });

      res.json({
        success: true,
        data: institute,
      });
    }
  );

  export const updateInstitute =
  asyncHandler(
    async (
      req: Request & { user?: any },
      res: Response
    ) => {

      const institute =
        await Institute.findOne({
          ownerId: req.user.userId,
        });

      if (!institute) {
        return res.status(404).json({
          success: false,
          message: "Institute not found",
        });
      }

      institute.name =
        req.body.name || institute.name;

      institute.email =
        req.body.email || institute.email;

      institute.address =
        req.body.address || institute.address;

      institute.registrationNumber =
        req.body.registrationNumber ||
        institute.registrationNumber;

      await institute.save();

      res.json({
        success: true,
        message:
          "Institute updated successfully",
        data: institute,
      });
    }
  );


  // 📈 GET INSTITUTE ANALYTICS (DASHBOARD METRICS)
export const getInstituteAnalyticsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user.instituteId;
    const objectId = new mongoose.Types.ObjectId(instituteId);

    // 1️⃣ QUICK METRICS (Total Students, Exams, Batches)
    const [totalStudents, activeExams, totalBatches] = await Promise.all([
      User.countDocuments({ role: "student", instituteId }),
      Test.countDocuments({ instituteId }), // Ya { instituteId, status: "published" }
      Batch.countDocuments({ instituteId })
    ]);

    // 2️⃣ AVERAGE ACCURACY (Institute level)
    const accAgg = await ExamAttempt.aggregate([
      { $match: { instituteId: objectId, status: "submitted" } },
      { $group: { _id: null, avgAccuracy: { $avg: "$percentage" } } }
    ]);
    const avgAccuracy = accAgg.length > 0 ? Math.round(accAgg[0].avgAccuracy) : 0;

    // 3️⃣ PERFORMANCE TREND (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendsAgg = await ExamAttempt.aggregate([
      { $match: { instituteId: objectId, status: "submitted", submittedAt: { $gte: sixMonthsAgo } } },
      { 
        $group: {
          _id: { month: { $month: "$submittedAt" }, year: { $year: "$submittedAt" } },
          avgScore: { $avg: "$percentage" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Purane se naya
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const performanceTrend = trendsAgg.map(t => ({
      month: monthNames[t._id.month - 1], // Convert month number to Name
      score: Math.round(t.avgScore)
    }));

    // 4️⃣ TOP BATCHES (Best Performing)
    const topBatchesAgg = await ExamAttempt.aggregate([
      { $match: { instituteId: objectId, status: "submitted" } },
      { $lookup: { from: "users", localField: "studentId", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { 
        $group: {
          _id: "$student.batchId",
          avgScore: { $avg: "$percentage" }
        }
      },
      { $sort: { avgScore: -1 } }, // Highest score first
      { $limit: 3 }, // Top 3 batches only
      { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batch" } },
      { $unwind: "$batch" }
    ]);

    // Calculate student count for these top batches
    const topBatches = await Promise.all(topBatchesAgg.map(async (b) => {
      const studentCount = await User.countDocuments({ batchId: b._id, role: "student" });
      return {
         name: b.batch.name,
         avgScore: `${Math.round(b.avgScore)}%`,
         students: studentCount
      };
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: { totalStudents, activeExams, avgAccuracy, totalBatches },
        performanceTrend,
        topBatches
      }
    });
  }
);