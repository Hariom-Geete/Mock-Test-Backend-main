import rateLimit from "express-rate-limit";

// ✅ GLOBAL LIMITER
export const globalLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 1000, // ✅ allow more requests in development

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests, please try again later.",
  },
});

// ✅ AUTH LIMITER
export const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again later.",
  },
});