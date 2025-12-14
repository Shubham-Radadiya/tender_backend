import { Router } from "express";
import Controller from "./controller";
import { upload } from "../../middleware/upload";

export default class WorkOrder extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.getWorkOrder);
    this.router.get("/tender/:tenderId", this.getWorkOrderByTenderId);
    this.router.get("/:id", this.getWorkOrder);
    this.router.post("/", upload.single("file"), this.createWorkOrder);
    this.router.put("/:id", upload.single("file"), this.updateWorkOrder);
    this.router.delete("/:id", this.deleteWorkOrder);
  }
}
