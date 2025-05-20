import { Request as ExpressRequest } from "express";
import { IUser } from "./modules/user";

export interface Request extends ExpressRequest {
  authUser?: IUser;
  files?: string;
  isAdmin?: boolean;
  isGm?: boolean;
}
