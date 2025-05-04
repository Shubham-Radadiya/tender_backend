import express from "express";
import * as path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";

//controllers
import { validateAuthIdToken } from "./middleware/validateAuthUser";
import Auth from "./controllers/auth";
import User from "./controllers/user";
import Category from "./controllers/category";
import Department from "./controllers/department";
import Image from "./controllers/image";
import Tender from "./controllers/tender";
import Company from "./controllers/company";
import TenderQuotation from "./controllers/tenderQuotation";
import Notification from "./controllers/notification";
import Bill from "./controllers/bill";

export default class App {
  public static instance: express.Application;
  private static port: number;
  public static start(port) {
    this.instance = express();
    this.port = port;

    // Add middlewares.
    this.initializeMiddleware();

    // Add controllers
    this.initializeControllers();
  }

  private static initializeMiddleware() {
    // CORS
    this.instance.use(
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: "x-auth-token",
      })
    );

    // Cookie parser.
    this.instance.use(cookieParser(process.env.COOKIE_SECRET));

    // Body Parser
    this.instance.use(express.json({ limit: "50mb" }));

    // support json encoded bodies
    this.instance.set("views", path.join(__dirname, "views"));
    this.instance.set("view engine", "ejs");
    this.instance.use(express.static(process.cwd() + "/public"));
  }
  private static initializeControllers() {
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/user", validateAuthIdToken, new User().router);
    this.instance.use("/category", validateAuthIdToken, new Category().router);
    this.instance.use(
      "/department",
      validateAuthIdToken,
      new Department().router
    );
    this.instance.use("/tender", validateAuthIdToken, new Tender().router);
    this.instance.use(
      "/tenderQuotation",
      validateAuthIdToken,
      new TenderQuotation().router
    );
    this.instance.use("/company", validateAuthIdToken, new Company().router);
    this.instance.use("/image", validateAuthIdToken, new Image().router);
    this.instance.use(
      "/notification",
      validateAuthIdToken,
      new Notification().router
    );
    this.instance.use("/billing", validateAuthIdToken, new Bill().router);
  }
}
