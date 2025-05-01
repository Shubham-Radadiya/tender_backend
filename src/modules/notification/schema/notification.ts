import { Schema, model } from "mongoose";
import { INotification } from "../types/notification";

export enum NotificationType {
  TENDER_CREATED = "TENDER_CREATED",
  TENDER_ACCEPTED = "TENDER_ACCEPTED",
  TENDER_DECLINED = "TENDER_DECLINED",
  TENDER_APPROVED = "TENDER_APPROVED"
}

const notification = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender", required: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>("notification", notification); 