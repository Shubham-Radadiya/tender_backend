import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { NotificationType } from "../schema";
import { IUser } from "../../user";
import { ITender } from "../../tender";

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

export class Notification implements INotification {
  _id?: string;
  userId: string | IUser;
  tenderId: string | ITender;
  type: NotificationType;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: INotification) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.userId = input.userId;
    this.tenderId = input.tenderId;
    this.type = input.type;
    this.message = input.message;
    this.isRead = input.isRead;
    this.readAt = input.readAt;  
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): INotification {
    return omitBy(this, isUndefined) as INotification;
  }
}