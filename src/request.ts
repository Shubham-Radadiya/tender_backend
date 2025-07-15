import { Request as ExpressRequest } from "express";
import { IUser } from "./modules/user";
import type { Multer } from "multer";

export interface Request extends ExpressRequest {
  authUser?: IUser;
  files?: string;
  isAdmin?: boolean;
  file?: Multer.File;
  isGm?: boolean;
}
