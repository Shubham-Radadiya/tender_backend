import { Router } from "express";
import Controller from "./controller";

export default class Company extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.get);
    this.router.get("/:id", this.get);
    this.router.put("/:id", this.update);
    this.router.post(
      "/assignToGM/:GmId",
      this.assignCompanyManagersToGroupManager
    );
    this.router.post(
      "/assignToBM/:BmId",
      this.assignCompanyManagersToBankManager
    );
  }
}
