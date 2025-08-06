import { Router } from "express";
import Controller from "./controller";

export default class TenderParty extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getTenderParty);
    this.router.get("/:id", this.getTenderParty);
    this.router.post("/", this.createTenderParty);
    this.router.put("/:id", this.updateTenderParty);
    this.router.delete("/:id", this.deleteTenderParty);
  }
}
