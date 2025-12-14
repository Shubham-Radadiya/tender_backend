import { IUser } from "../modules/user"; // Adjust path as needed
import { NotificationType } from "../modules/notification/schema/notification";
import { createNotification, Notification } from "../modules/notification";
import { getIO } from "../socket";

export const sendNotification = async (
  userId: string | IUser,
  type: NotificationType,
  message: string,
  tenderId?: string
) => {
  const notification = new Notification({
    userId: userId as string,
    tenderId: tenderId || null,
    type,
    message,
    isRead: false,
  });
  const saved = await createNotification(notification);
  const io = getIO();
  io.to(userId as string).emit("notification:receive", saved);
};
