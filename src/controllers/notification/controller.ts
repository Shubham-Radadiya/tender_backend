import { Response } from "express";
import { Request } from "../../request";
import { getPaginatedNotifications } from "../../modules/notification/getPaginatedNotifications";

export default class Controller {
protected readonly getPaginatedNotification = async (req: Request, res: Response) => {
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
}