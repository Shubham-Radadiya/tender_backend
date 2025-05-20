import { Router } from "express";
import Controller from "./controllers";
import { validateAuthIdToken } from "../../middleware/validateAuthUser";

export default class Chat {
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const controller = new Controller();

    // Chat room routes
    this.router.post("/rooms", validateAuthIdToken, controller.createChatRoom);
    this.router.get("/rooms", validateAuthIdToken, controller.getUserRooms);
    this.router.get(
      "/rooms/:roomId/messages",
      validateAuthIdToken,
      controller.getRoomMessages
    );

    // Message routes
    this.router.put(
      "/messages/:messageId/read",
      validateAuthIdToken,
      controller.markMessageAsRead
    );
  }
}
