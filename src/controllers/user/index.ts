import { Router } from "express";
import Controller from "./controller";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";

export default class User extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.get);
    this.router.get("/search", this.searchUser);
    this.router.get("/:id", this.get);
    this.router.post("/", validateIsAdmin, this.createUser);
    this.router.put("/:id", this.updateUser);
    this.router.delete("/:id", this.deleteUser);
  }
}
