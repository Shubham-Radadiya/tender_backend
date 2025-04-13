import { Router } from "express";
import Controller from "./controller";
import { validateAuthIdToken } from "../../middleware/validateAuthUser";

export default class Auth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.login);
    this.router.get("/addTestUsers", this.addUsers);
    this.router.post("/resetPassword", validateAuthIdToken, this.resetPassword);
  }
}
