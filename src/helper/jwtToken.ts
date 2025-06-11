import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
const jwt_secret = process.env.JWT_SECRET!;

export const generateToken = (userId: string) => {
  const payload = {
    userId,
  };

  const token = jwt.sign(payload, jwt_secret, {
    expiresIn: "1d", // or "1h", "7d", etc.
  });

  return token;
};

export const verifyToken = <T = any>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token.trim(), jwt_secret) as T;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
