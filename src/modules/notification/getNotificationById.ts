import { NotificationModel } from "./schema/notification";

export const getNotificationById = async (id: string) => {
  const notification = await NotificationModel.findById({ _id: id });
  return notification ? notification : null;
}; 