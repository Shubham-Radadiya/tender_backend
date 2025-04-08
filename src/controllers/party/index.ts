import { Router } from "express";
import Controller from "./controller";

export default class Party extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getParty);
    this.router.get("/:id", this.getParty);
    this.router.post("/", this.createParty);
    this.router.put("/:id", this.updateParty);
    this.router.delete("/:id", this.deleteParty);
  }
}
