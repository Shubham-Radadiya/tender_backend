import { Router } from "express";
import { filesUpload } from "../../middleware/filesUpload";
import { validateAuthIdToken } from "../../middleware/validateAuthUser";
import Controller from "./controller";

export default class Image extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", filesUpload,validateAuthIdToken, this.createImage);
  }
}
