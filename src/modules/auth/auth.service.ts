import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  createUser,
  findUserByEmail,
} from "../users/user.service.js";
import { AppError } from "../../shared/utils/AppError.js";
import { Session } from "./session.model.js";
import { getIO, getUserSocket } from "../../config/socket.config.js";
import { generateUniqueUsername } from "../../shared/utils/username.util.js";
import { generateToken } from "../../shared/utils/generateToken.js";
import { generateResetToken } from "../../shared/utils/generateResetToken.js";
import { resetPasswordTemplate } from "../../shared/templates/resetPasswordTemplate.js";
import { findUserForLogin } from "../users/user.service.js";
import User from "../users/user.model.js";
import { sendEmail } from "../../shared/utils/sendemail.js";
import Institute from "../institutes/institute.model.js";
/**
 * 🏢 Register Institute
 */

export const registerUser = async (
  adminName: string,
  instituteName: string,
  email: string,
  password: string
) => {
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    throw new AppError("Email already exists", 400);
  }

  const username =
    await generateUniqueUsername(adminName);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name: adminName,
    email,
    username,
    password: hashedPassword,
    role: "institute",
  });
  const institute =
    await Institute.create({

      name: instituteName,

      email,

      ownerId: user._id,
    });

  user.instituteId = institute._id;

  await user.save();
  const userObj = user.toObject();
  const { password: _p, ...safeUser } = userObj;

  // 🔥 ADD THIS
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    instituteId:
      user.instituteId?.toString(),
  });

  // ✅ CREATE SESSION
  await Session.create({
    userId: user._id,
    token,
    userAgent: "register",
  });

  return {
    user: safeUser,
    token,
  };
};

/**
 * 🔐 Login (email OR username)
import Institute from "../institutes/institute.model.js";
 */

export const loginUser = async (
  identifier: string,
  password: string,
  userAgent?: string
) => {
  // 🔥 FIX: use login-specific finder
  const user = await findUserForLogin(identifier);

  if (!user) throw new AppError("Invalid credentials", 400);

  // 🔐 compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 400);

  // 🎟️ generate token
  const token = generateToken({
    userId: user._id.toString(),
    role: user.role,
    instituteId: user.instituteId?.toString(),
  });

  // 🔥 FORCE LOGOUT OLD DEVICE (SOCKET)
  const oldSocketId = getUserSocket(user._id.toString());
  if (oldSocketId) {
    const io = getIO();
    io.to(oldSocketId).emit("force_logout");
  }

  // 🔥 SINGLE DEVICE LOGIN
  await Session.deleteMany({ userId: user._id });

  await Session.create({
    userId: user._id,
    token,
    userAgent,
  });

  // 🔐 remove password
  const userObj = user.toObject();
  const { password: _p, ...safeUser } = userObj;

  return { user: safeUser, token };
};

/**
 * 🚪 Logout
 */
export const logoutUser = async (userId: string, token: string) => {
  await Session.deleteOne({ userId, token });
};

// FORGATE PASSWORD
export const forgotPassword = async (email: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 🔥 generate tokens
  const { resetToken, hashedToken } = generateResetToken();

  // ⏰ expiry (15 min)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  // 🔗 frontend reset link
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  await sendEmail(
    user.email,
    "Reset Your Password",
    resetPasswordTemplate(resetUrl)
  );

  return {
    message: "Reset email sent",
  };
};


export const resetPassword = async (
  token: string,
  password: string
) => {

  // 🔒 hash incoming token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 🔍 find valid user
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  // 🔐 hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;

  // 🧹 clear reset fields
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: "Password reset successful",
  };
};


export const changePassword =
  async (

    userId: string,

    oldPassword: string,

    newPassword: string
  ) => {

    // ✅ FIND USER
    const user =
      await User.findById(
        userId
      ).select("+password");

    if (!user) {

      throw new AppError(
        "User not found",
        404
      );
    }

    // ✅ CHECK OLD PASSWORD
    const isMatch =
      await bcrypt.compare(

        oldPassword,

        user.password
      );

    if (!isMatch) {

      throw new AppError(
        "Old password is incorrect",
        400
      );
    }

    // ✅ HASH NEW PASSWORD
    const hashedPassword =
      await bcrypt.hash(

        newPassword,

        10
      );

    // ✅ UPDATE PASSWORD
    user.password =
      hashedPassword;

    // 🚨 IMPORTANT
    user.mustChangePassword =
      false;

    await user.save();

    return {

      message:
        "Password changed successfully",
    };
  };
