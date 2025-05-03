import { Schema, model } from "mongoose";
import { INotification } from "../types";

export enum NotificationType {
  TENDER_CREATED = "TENDER_CREATED",
  TENDER_ACCEPTED = "TENDER_ACCEPTED",
  TENDER_DECLINED = "TENDER_DECLINED",
  TENDER_APPROVED = "TENDER_APPROVED",
}

const notification = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user" },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender" },
    type: {
      type: String,
      enum: Object.values(NotificationType),
    },
    message: { type: String },
    isRead: { type: Boolean },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>(
  "notification",
  notification
);
