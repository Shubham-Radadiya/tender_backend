import { Router } from "express";
import Controller from "./controller";

export default class PartyWork extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getPartyWork);
    this.router.get("/:id", this.getPartyWork);
    this.router.post("/", this.createPartyWork);
    this.router.put("/:id", this.updatePartyWork);
    this.router.delete("/:id", this.deletePartyWork);
  }
}
