import { Router } from "express";
import Controller from "./controller";

export default class Tender extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/forGM", this.getTenderForGM);
    this.router.get("/byStatus", this.getTenderByStatus);
    this.router.get("/", this.getTender);
    this.router.get("/:id", this.getTender);
    this.router.post("/", this.createTender);
    this.router.put("/:id", this.updateTender);
    this.router.put("/accept/:id", this.tenderAccepted);
    this.router.put("/gotTo/:id", this.tenderGotTo);
    this.router.delete("/:id", this.deleteTender);
  }
}
