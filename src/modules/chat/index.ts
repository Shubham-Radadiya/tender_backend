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

    this.router.post("/", validateAuthIdToken, controller.createChat);
    this.router.get("/:chatId", validateAuthIdToken, controller.getChatHistory);
    this.router.get(
      "/user/chats",
      validateAuthIdToken,
      controller.getUserChats
    );
  }
}
