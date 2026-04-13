import { Request as ExpressRequest } from "express";
import { IUser } from "./modules/user";
import type { Multer } from "multer";

type RequestParams = Record<string, string>;
type RequestQuery = Record<string, string>;

export interface Request
  extends ExpressRequest<RequestParams, any, any, RequestQuery> {
  authUser?: IUser;
  files?: string;
  isAdmin?: boolean;
  file?: Multer.File;
  isGm?: boolean;
}
