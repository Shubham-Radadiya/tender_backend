import { Router } from "express";
import Controller from "./controller";

export default class Transaction extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getTransaction);
    this.router.get("/:id", this.getTransaction);
    this.router.post("/", this.createTransaction);
    this.router.put("/:id", this.updateTransaction);
    this.router.delete("/:id", this.deleteTransaction);
  }
}
