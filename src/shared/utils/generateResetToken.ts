import crypto from "crypto";

export const generateResetToken = () => {
  // 🔥 raw token (sent to user)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 🔒 hashed token (stored in DB)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return {
    resetToken,
    hashedToken,
  };
};