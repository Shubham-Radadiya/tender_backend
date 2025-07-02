import { Router } from "express";
import Controller from "./controller";

export default class TenderNotice extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.createTenderNoticeQuotation);
    this.router.put("/addDays", this.addTenderNoticeDays);
  }
}
