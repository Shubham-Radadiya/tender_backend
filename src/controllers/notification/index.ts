import { Router } from "express";
import Controller from "./controller";

export default class Notification extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getPaginatedNotification);
    this.router.put("/status/:id", this.updateNotificationStatus);
  }
} 