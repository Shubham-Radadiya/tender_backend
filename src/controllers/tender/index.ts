import { Router } from "express";
import Controller from "./controller";
import { upload } from "../../middleware/upload";

export default class Tender extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/forGM", this.getTenderForGM);
    this.router.get("/forCM", this.getTenderForCM);
    this.router.put("/addNotice", upload.single("file"), this.addTenderNotice);
    this.router.put("/addDays", this.addTenderNoticeDays);
    this.router.get("/byStatus", this.getTenderByStatus);
    this.router.get("/", this.getTender);
    this.router.get("/:id", this.getTender);
    this.router.post("/", this.createTender);
    this.router.put("/updateStatus", this.updateTenderStatus);
    this.router.put("/:id", this.updateTender);
    this.router.put("/accept/:id", this.tenderAccepted);
    this.router.put("/gotTo/:id", this.tenderGotTo);
    this.router.put("/approve/:id", this.approveTender);
    this.router.delete("/:id", this.deleteTender);
    this.router.put("/acceptByCM/:id", this.tenderAcceptedByCM);
    this.router.put("/passToCM/:id", this.passTenderToCM);
    this.router.get("/party-data/:id", this.getTenderPartyData);
  }
}
