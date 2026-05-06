import User from "./user.model.js";

import { AppError }
  from "../../shared/utils/AppError.js";

import bcrypt from "bcrypt";

import {
  createNotification,
  sendNotification
} from "../notifications/notification.service.js";

import {
  sendEmail
} from "../../shared/utils/sendemail.js";

import {
  studentCredentialsTemplate
} from "../../shared/templates/studentCredentialsTemplate.js";

/**
 * 🧑 CREATE USER
 */
export const createUser =
  async (data: any) => {

    try {

      const user =
        await User.create(data);

      return user;

    } catch (err: any) {

      // ❌ DUPLICATE KEY
      if (err.code === 11000) {

        const field =
          Object.keys(
            err.keyPattern
          )[0];

        throw new AppError(

          `${field} already exists`,

          400
        );
      }

      throw err;
    }
  };

/**
 * 🔍 FIND BY EMAIL
 */
export const findUserByEmail =
  async (email: string) => {

    return await User.findOne({
      email,
    });
  };

/**
 * 🔍 FIND BY USERNAME
 */
export const findUserByUsername =
  async (username: string) => {

    return await User.findOne({
      username,
    });
  };

/**
 * 🔐 FIND FOR LOGIN
 */
export const findUserForLogin =
  async (identifier: string) => {

    return await User.findOne({

      $or: [

        {
          email: identifier
        },

        {
          username: identifier
        },
      ],
    })

      .select("+password");
  };

/**
 * 🔍 FIND USER BY ID
 */
export const findUserById =
  async (id: string) => {

    const user =
      await User.findById(id)

        .select("-password");

    if (!user) {

      throw new AppError(
        "User not found",
        404
      );
    }

    return user;
  };

/**
 * 👨‍🎓 CREATE STUDENT
 */
export const createStudentUser =
  async (

    data: {

      name: string;

      email: string;

      username: string;

      password: string;

      batchId: string;
    },

    instituteId: string
  ) => {

    try {

      // 🔐 GENERATE TEMP PASSWORD
      const tempPassword =

        Math.random()

          .toString(36)

          .slice(-8);

      // 🔐 HASH PASSWORD
      const hashedPassword =

        await bcrypt.hash(

          tempPassword,

          10
        );

      // ✅ CREATE STUDENT
      const student =

        await User.create({

          name:
            data.name,

          email:
            data.email,

          username:
            data.username,

          password:
            hashedPassword,

          batchId:
            data.batchId,

          role:
            "student",

          instituteId,

          status:
            "active",

          mustChangePassword:
            true,
        });

      // 🔔 FIND INSTITUTE USER
      const instituteUser =

        await User.findOne({

          instituteId,

          role:
            "institute",
        });

      // 🔔 CREATE NOTIFICATION
      if (instituteUser) {

        await sendNotification({

          userId:
            instituteUser._id.toString(),

          title:
            "New Student Added",

          message:
            `${data.name} has been added successfully.`,

          type:
            "system",

          link:
            "/institute/admin/students",

          event:
            "student_creation",
        });
      }

      // 📧 SEND EMAIL
      await sendEmail(

        data.email,

        "Your BrainMock Student Account",

        studentCredentialsTemplate(

          data.name,

          data.email,

          tempPassword
        )
      );

      // 🔐 REMOVE PASSWORD
      const obj =
        student.toObject();

      const {

        password: _p,

        ...safeStudent

      } = obj;

      return safeStudent;

    } catch (err: any) {

      // ❌ DUPLICATE KEY
      if (err.code === 11000) {

        const field =

          Object.keys(
            err.keyPattern
          )[0];

        throw new AppError(

          `${field} already exists`,

          400
        );
      }

      throw err;
    }
  };

/**
 * ❌ DELETE STUDENT
 */
export const deleteStudentByInstitute =
  async (

    studentId: string,

    instituteId: string
  ) => {

    const student =

      await User.findOne({

        _id:
          studentId,

        role:
          "student",

        instituteId,
      });

    if (!student) {

      throw new AppError(

        "Student not found or unauthorized",

        404
      );
    }

    await student.deleteOne();

    return true;
  };

/**
 * 📋 GET STUDENTS
 */
export const getStudentsByInstitute =
  async (
    instituteId: string
  ) => {

    return await User.find({

      role:
        "student",

      instituteId,
    })

      .populate(
        "batchId",
        "name"
      )

      .select("-password")

      .sort({
        createdAt: -1,
      });
  };

/**
 * ✏️ UPDATE STUDENT
 */
export const updateStudentByInstitute =
  async (

    studentId: string,

    instituteId: string,

    data: {

      name: string;

      email: string;

      batchId: string;

      status: string;
    }
  ) => {

    const student =

      await User.findOne({

        _id:
          studentId,

        role:
          "student",

        instituteId,
      });

    if (!student) {

      throw new AppError(

        "Student not found or unauthorized",

        404
      );
    }

    student.name =
      data.name;

    student.email =
      data.email;

    student.batchId =
      data.batchId as any;

    student.status =
      data.status as any;

    await student.save();

    return student;
  };