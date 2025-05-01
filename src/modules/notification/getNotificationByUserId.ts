import { Notification } from ".";
import { NotificationModel } from "./schema/notification";

export const getNotificationByUserId = async (userId: string) => {
  const notifications = await NotificationModel.find({userId}).sort({createdAt: -1});
  return notifications ? notifications.map((item) => new Notification(item)) : null;
}; 