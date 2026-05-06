import jwt, { SignOptions } from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  role: string;
  instituteId?: string;
};

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, secret, options);
};