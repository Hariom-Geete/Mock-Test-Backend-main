import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "mongo-sanitize";

// Middlewares
import { errorHandler } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";

// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import batchRoutes from "./modules/batches/batch.routes.js";
import instituteRoutes from "./modules/institutes/institute.routes.js";
import testRoutes from "./modules/tests/test.routes.js";
import questionRoutes from "./modules/questions/question.routes.js";
import attemptRoutes from "./modules/attempt/attempt.routes.js";
import aiRoutes from "./modules/ai-generator/ai.routes.js"; // 🔥 From HEAD
import supportRoutes from "./modules/support/support.routes.js"; // 🔥 From main
import contactRoutes from "./modules/contact/contact.routes.js"; // 🔥 From main
import notificationRoutes from "./modules/notifications/notification.routes.js"; // 🔥 From main
import notificationSettingRoutes from "./modules/notifications/notification-setting.routes.js";
import superadminRoutes from "./modules/superadmin/superadmin.routes.js"; // 🔥 From main

const app = express();

/**
 * ====================================================
 * 🔐 SECURITY MIDDLEWARES
 * ====================================================
 */

// ✅ Secure HTTP headers
app.use(helmet());

// ✅ Global rate limiter
app.use(globalLimiter);

// ✅ CORS
app.use(
  cors({
    origin: "http://localhost:5173", // ⚠️ change in production
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json({ limit: "10kb" }));

// ✅ NoSQL injection protection
app.use((req, _res, next) => {
  req.body = mongoSanitize(req.body);
  next();
});

/**
 * ====================================================
 * 🚀 API ROUTES
 * ====================================================
 */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);             // ✅ AI Route added
app.use("/api/attempts", attemptRoutes);
app.use("/api/support", supportRoutes);   // ✅ Support Route added
app.use("/api/contact", contactRoutes);   // ✅ Contact Route added
app.use("/api/notifications", notificationRoutes); // ✅ Notification Route added
app.use("/api/notification-settings", notificationSettingRoutes);
app.use("/api/superadmin", superadminRoutes); // ✅ Super Admin Route added

/**
 * ====================================================
 * 🧪 HEALTH CHECK
 * ====================================================
 */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running...",
  });
});

/**
 * ====================================================
 * ❌ GLOBAL ERROR HANDLER
 * ====================================================
 */

app.use(errorHandler);

export default app;