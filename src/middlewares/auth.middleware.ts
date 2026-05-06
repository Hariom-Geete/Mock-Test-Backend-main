import jwt from "jsonwebtoken";

import { Session } from "../modules/auth/session.model.js";

import User from "../modules/users/user.model.js";

export const protect = async (
  req: any,
  res: any,
  next: any
) => {

  try {

    let token;

    // ✅ Get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token =
        req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ✅ Verify JWT
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    // ✅ Check session exists
    const session = await Session.findOne({
      userId: decoded.userId,
      token,
    });

    if (!session) {

      return res.status(401).json({
        success: false,
        message:
          "Session expired. Login again.",
      });
    }

    // ✅ Check user still exists
    const user = await User.findById(
      decoded.userId
    );

    if (!user) {

      return res.status(401).json({
        success: false,
        message:
          "User no longer exists",
      });
    }

    // ✅ Attach decoded user
    req.user = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const authorize =
  (...roles: string[]) => {

    return (
      req: any,
      res: any,
      next: any
    ) => {

      if (
        !req.user ||
        !roles.includes(req.user.role)
      ) {

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    };
  };