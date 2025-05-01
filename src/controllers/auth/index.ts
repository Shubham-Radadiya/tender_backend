import { Router } from "express";
import Controller from "./controller";
import { validateAuthIdToken } from "../../middleware/validateAuthUser";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";

export default class Auth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.login);
    this.router.post("/forgotPassword", this.forgotPassword);
    this.router.post("/verifyOtp", this.verifyOtp);
    this.router.get("/addTestUsers", this.addUsers);
    this.router.post("/resetPassword", validateAuthIdToken, this.resetPassword);
    this.router.post("/logout", validateAuthIdToken, this.logout);
    this.router.post("/impersonate/:userId", validateAuthIdToken, validateIsAdmin, this.impersonate);
    this.router.post("/stop-impersonating", validateAuthIdToken, this.stopImpersonating);
  }
}
