import { Response } from "express";
import { Request } from "../../request";
import { getPaginatedNotifications } from "../../modules/notification/getPaginatedNotifications";
import {
  getNotificationById,
  Notification,
  updateNotification,
} from "../../modules/notification";

export default class Controller {
  protected readonly getPaginatedNotification = async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId = req.authUser?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await getPaginatedNotifications(userId, { page, limit });

      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    } catch (error) {
      console.log("Error in getNotification", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error fetching notifications",
      });
      return;
    }
  };

  protected readonly updateNotificationStatus = async (
    req: Request,
    res: Response
  ) => {
    try {
      const notificationId = req.params.id;

      const existingNotification = await getNotificationById(notificationId);
      if (!existingNotification) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      const updated = await updateNotification(
        new Notification({ ...existingNotification.toObject(), isRead: true })
      );
      res
        .status(200)
        .json({ message: "Notification status updated.", data: updated });
      return;
    } catch (error) {
      console.log("Error in updateNotification", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
