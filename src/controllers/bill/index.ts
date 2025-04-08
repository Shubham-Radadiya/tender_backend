import { Router } from "express";
import Controller from "./controller";

export default class Bill extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getBill);
    this.router.get("/:id", this.getBill);
    this.router.post("/", this.createBill);
    this.router.put("/:id", this.updateBill);
    this.router.delete("/:id", this.deleteBill);
  }
}
