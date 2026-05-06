import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createStudentUser,
  deleteStudentByInstitute,
  getStudentsByInstitute,
  updateStudentByInstitute,
} from "./user.service.js";
import { generateUsername } from "../../shared/utils/generateUsername.js";
import { AppError } from "../../shared/utils/AppError.js";
import bcrypt from "bcrypt";
import User from "./user.model.js";
import ExcelJS from "exceljs";
import { generateUniqueUsername } from "../../shared/utils/username.util.js";
import Batch from "../batches/batch.model.js";
import { sendEmail } from "../../shared/utils/sendemail.js";
import { studentCredentialsTemplate } from "../../shared/templates/studentCredentialsTemplate.js";
import { uploadOnCloudinary } from "../../shared/utils/cloudinary.js";

export const createStudentController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const { name, email, batchId } = req.body;
    // 🔐 Get instituteId from token (NEVER from frontend)
    const instituteId = req.user?.instituteId;
    if (!instituteId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔥 Generate username automatically
    const username = await generateUsername(name);
    const tempPassword = `EXAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const student = await createStudentUser(
      { name, email, username, password: tempPassword, batchId },
      instituteId,
    );
    try {
      // ✅ FIXED: Second argument is Subject now!
      await sendEmail(
        email,
        "Welcome to ExamAI - Your Login Credentials 🎓",
        studentCredentialsTemplate(name, email, tempPassword),
      );
    } catch (error) {
      console.log("Email error (User created):", error);
    }

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: { student, username, tempPassword },
    });
  },
);

export const deleteStudentController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user.instituteId;
    const studentId = req.params.id as string;

    await deleteStudentByInstitute(studentId, instituteId);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  },
);

export const getStudentsController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user?.instituteId;
    const students = await getStudentsByInstitute(instituteId);

    res.status(200).json({
      success: true,
      data: students,
    });
  },
);

export const updateStudentController = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const instituteId = req.user.instituteId;

    const studentId = req.params.id as string;

    const student = await updateStudentByInstitute(
      studentId,
      instituteId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  },
);

// ── 🏢 UPDATE INSTITUTE PROFILE ──
export const updateProfile = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    const user = await User.findById(req.user.instituteId);

    if (!user) throw new AppError("User not found", 404);

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    await user.save();

    res.json({ success: true, message: "Profile updated", data: user });
  },
);

// ── 🎓 UPDATE STUDENT PROFILE (NEW API FOR STUDENT PORTAL) ──
export const updateStudentProfile = asyncHandler(
  async (req: Request & { user?: any; file?: any }, res: Response) => {
    // req.user.userId is used assuming standard auth middleware attaches it for students
    const student = await User.findById(req.user.userId); 
    
    if (!student) throw new AppError("Student not found", 404);

    // Update details
    if (req.body.name) student.name = req.body.name;
    if (req.body.phone) student.phone = req.body.phone;
    if (req.body.targetYear) student.targetYear = req.body.targetYear;

    // 📸 Handle Cloudinary Image Upload
    if (req.file) {
      const cloudinaryRes = await uploadOnCloudinary(req.file.path);
      if (cloudinaryRes && cloudinaryRes.secure_url) {
        student.profileImage = cloudinaryRes.secure_url; // ⚠️ User model me 'profileImage: String' daal lena
      }
    }

    await student.save();

    res.json({
      success: true,
      message: "Student Profile updated successfully",
      data: student,
    });
  },
);

export const importStudentsController = asyncHandler(async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "CSV file required",
    });
  }

  // ✅ Read Excel/CSV
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.worksheets[0];

  const students: any[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    students.push({
     name: row.getCell(1).value?.toString() || "",
      email: row.getCell(2).value?.toString() || "",
      batchName: row.getCell(3).value?.toString() || "",
    });
  });

  const createdStudents = [];

  for (const row of students as any[]) {
    const { name, email, batchName } = row;

    // ✅ Validate row
    if (!name || !email || !batchName) {
      continue;
    }

    // ✅ Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      continue;
    }

    // ✅ Find batch by name
    const batch = await Batch.findOne({
      name: { $regex: new RegExp(`^${batchName.trim()}$`, "i") },
      instituteId: req.user.instituteId,
    });

    // ❌ Batch not found
    if (!batch) {
      console.log(`Batch not found: ${batchName}`);
      continue;
    }

    const username = await generateUniqueUsername(name);
    const tempPassword = "123456";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ Create student
    const student = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role: "student",
      instituteId: req.user.instituteId,
      batchId: batch._id,
      status: "active",
      mustChangePassword: true
    });
    createdStudents.push(student);
  }

  res.json({
    success: true,
    message: "Students imported successfully",

    total: createdStudents.length,
  });
});
