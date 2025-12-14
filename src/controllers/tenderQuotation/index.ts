import { Router } from "express";
import Controller from "./controller";

export default class TenderQuotation extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.createTenderQuotation);
    this.router.put("/updatePersonalDetails", this.updatePersonalDetails);
    this.router.get(
      "/gerPersonalDetails/:id",
      this.getQuotationPersonalDetails
    );
    this.router.put("/:id", this.updateTenderQuotations);
    this.router.delete("/:id", this.deleteTenderQuotation);
  }
}
