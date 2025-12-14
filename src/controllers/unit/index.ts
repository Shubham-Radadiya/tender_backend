import { Router } from "express";
import Controller from "./controller";

export default class Unit extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getUnit);
    this.router.post("/", this.createUnit);
    this.router.put("/:id", this.updateUnit);
    this.router.delete("/:id", this.deleteUnitById);
  }
}
