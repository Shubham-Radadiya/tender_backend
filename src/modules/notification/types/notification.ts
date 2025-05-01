import { Types } from "mongoose";
import { IUser } from "../../user";
import { ITender } from "../../tender";
import { NotificationType } from "../schema/notification";

export interface INotification {
  _id?: string;
  userId: string | IUser;
  tenderId: string | ITender;
  type: NotificationType;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
} 