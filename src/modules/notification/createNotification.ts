import { Notification } from ".";
import { NotificationModel } from "./schema/notification";

/**
 * Create a new notification
 * @param notification - Notification object
 * @returns Created notification
 */
export const createNotification = async (notification: Notification) => {
  const newNotification = await NotificationModel.create(notification.toJSON());
  return new Notification(newNotification.toObject());
}; 