import { Router } from "express";
import Controller from "./controller";

export default class Department extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getDepartment);
    this.router.get("/:id", this.getDepartment);
    this.router.post("/", this.createDepartment);
    this.router.put("/:id", this.updateDepartment);
    this.router.delete("/:id", this.deleteDepartment);
  }
}
