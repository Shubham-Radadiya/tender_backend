import jwt from "jsonwebtoken";
import { IUser } from "../modules/user"; // Adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Store securely

export const generateToken = (userId) => {
  const payload = {
    userId,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d", // or "1h", "7d", etc.
  });

  return token;
};

export const verifyToken = <T = any>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};
