import { NotificationType } from "./schema/notification";
import { INotification } from "./types/notification";

export class Notification {
  private _id?: string;
  private userId: string;
  private tenderId: string;
  private type: NotificationType;
  private message: string;
  private isRead: boolean;
  private readAt?: Date;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(notification: INotification) {
    this._id = notification._id;
    this.userId = notification.userId as string;
    this.tenderId = notification.tenderId as string;
    this.type = notification.type;
    this.message = notification.message;
    this.isRead = notification.isRead;
    this.readAt = notification.readAt;
    this.createdAt = notification.createdAt;
    this.updatedAt = notification.updatedAt;
  }

  toJSON(): INotification {
    return {
      _id: this._id,
      userId: this.userId,
      tenderId: this.tenderId,
      type: this.type,
      message: this.message,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export * from "./createNotification"; 