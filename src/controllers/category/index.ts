import { Router } from "express";
import Controller from "./controller";

export default class Category extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getCategory);
    this.router.get("/:id", this.getCategory);
    this.router.post("/", this.createCategory);
    this.router.put("/:id", this.updateCategory);
    this.router.delete("/:id", this.deleteCategory);
  }
}
