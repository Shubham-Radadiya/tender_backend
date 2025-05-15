import { Notification } from ".";
import { NotificationModel } from "./schema";

/**
 *
 * @param notification
 * @returns update notification record
 */
export const updateNotification = async (notification: Notification) => {
  await NotificationModel.findByIdAndUpdate(notification._id, notification.toJSON());
  return notification;
};
