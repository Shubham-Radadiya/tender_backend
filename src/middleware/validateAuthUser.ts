import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "../request";
import { getUserById, User } from "../modules/user";
import { set as setGlobalContext } from "express-http-context";
import { verifyToken } from "../helper/jwtToken";

export const validateAuthIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    res
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  const decodedToken = verifyToken(token);
  if (!decodedToken) {
    res
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  const userId = decodedToken.userId;

  if (!userId) {
    res.clearCookie("admin_auth", {
      signed: true,
    });
    res
      .clearCookie("auth", {
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }

  const user: User = await getUserById(userId);
  if (!user) {
    res.clearCookie("admin_auth", {
      signed: true,
    });
    res
      .clearCookie("auth", {
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }

  const userRawData = user.toJSON();

  req.authUser = userRawData;
  req.isAdmin = userRawData.role === "ADMIN";
  req.isGm = userRawData.role === "GROUP_MANAGER";
  setGlobalContext("authUser", userRawData);

  next();
  return;
};
