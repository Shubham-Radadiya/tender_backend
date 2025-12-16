import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { SocketService } from "./service/socket.service";
import { validateAuthIdToken } from "./middleware/validateAuthUser";
import Auth from "./controllers/auth";
import User from "./controllers/user";
import Chat from "./modules/chat";
import Category from "./controllers/category";
import Bill from "./controllers/bill";
import Party from "./controllers/party";
import PartyWork from "./controllers/partyWork";
import path from "path";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import Tender from "./controllers/tender";
import TenderQuotation from "./controllers/tenderQuotation";
import Company from "./controllers/company";
import Image from "./controllers/image";
import Notification from "./controllers/notification";
import Department from "./controllers/department";
import { createServer } from "http";

configDotenv();
import TenderParty from "./controllers/tenderParty";
import Unit from "./controllers/unit";
import WorkOrder from "./controllers/workOrder";

export default class App {
  private static instance: express.Application;
  private static httpServer: any;
  private static io: Server;

  private constructor() {}

  public static getInstance(): express.Application {
    if (!App.instance) {
      App.instance = express();
      App.initializeMiddleware();
      App.initializeControllers();
      App.initializeSocket();
    }
    return App.instance;
  }

  private static initializeSocket() {
    // Create HTTP server
    App.httpServer = createServer(App.instance);

    // Initialize Socket Service with the HTTP server
    const socketService = SocketService.getInstance();
    socketService.initialize(App.httpServer);
    App.io = socketService.getIO();

    // Socket authentication middleware
    // App.io.use((socket, next) => {
    //   let token = socket.handshake.auth.token;
    //   if (!token) {
    //     token = socket.handshake.query?.token;
    //   }
    //   if (!token) {
    //     return next(new Error("Authentication required"));
    //   }

    //   try {
    //     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    //     socket.data.user = decoded;
    //     next();
    //   } catch (err) {
    //     next(new Error("Invalid token"));
    //   }
    // });
  }

  public static listen(port: number): void {
    if (!App.httpServer) {
      throw new Error("HTTP server not initialized");
    }
    App.httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }

  private static initializeControllers() {
    // Routes
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/user", validateAuthIdToken, new User().router);
    this.instance.use("/chat", validateAuthIdToken, new Chat().router);
    this.instance.use("/category", validateAuthIdToken, new Category().router);
    this.instance.use(
      "/department",
      validateAuthIdToken,
      new Department().router
    );
    this.instance.use("/bill", validateAuthIdToken, new Bill().router);
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
    this.instance.use("/party", validateAuthIdToken, new Party().router);
    this.instance.use(
      "/tenderParty",
      validateAuthIdToken,
      new TenderParty().router
    );
    this.instance.use(
      "/workOrder",
      validateAuthIdToken,
      new WorkOrder().router
    );
    this.instance.use("/unit", validateAuthIdToken, new Unit().router);
    this.instance.use(
      "/partyWork",
      validateAuthIdToken,
      new PartyWork().router
    );
    this.instance.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );
  }

  private static initializeMiddleware() {
    // CORS
    this.instance.use(
      cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Cookie parser
    this.instance.use(cookieParser(process.env.COOKIE_SECRET));

    // Body Parser
    this.instance.use(express.json({ limit: "50mb" }));
    this.instance.use(express.urlencoded({ extended: true, limit: "50mb" }));

    // View engine setup
    this.instance.set("views", path.join(__dirname, "views"));
    this.instance.set("view engine", "ejs");
    this.instance.use(express.static(process.cwd() + "/public"));

    // Error handling middleware
    this.instance.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something broke!" });
      }
    );
  }
}
