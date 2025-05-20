import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketService } from "./modules/socket/socket.service";
import { validateAuthIdToken } from "./middleware/validateAuthUser";
import Auth from "./controllers/auth";
import User from "./controllers/user";
import Chat from "./modules/chat";
import Category from "./controllers/category";
import Bill from "./controllers/bill";
import path from "path";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv();

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

    // Initialize Socket.IO
    App.io = new Server(App.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      allowEIO3: true,
    });

    // Socket authentication middleware
    App.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    // Socket connection handling
    App.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join_room", (data, callback) => {
        const { roomId } = data;
        if (!roomId) {
          callback({ error: "Room ID is required" });
          return;
        }
        socket.join(roomId);
        callback({ success: true, roomId });
      });

      socket.on("send_message", (data, callback) => {
        const { roomId, content } = data;
        if (!roomId || !content) {
          callback({ error: "Room ID and content are required" });
          return;
        }
        socket.to(roomId).emit("message_received", { roomId, content });
        callback({ success: true });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    // Initialize Socket Service
    SocketService.getInstance().initialize(App.io);
  }

  public static listen(port: number): void {
    App.httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }

  private static initializeControllers() {
    // Routes
    this.instance.use("/api/auth", new Auth().router);
    this.instance.use("/api/users", validateAuthIdToken, new User().router);
    this.instance.use("/api/chat", validateAuthIdToken, new Chat().router);
    this.instance.use(
      "/api/category",
      validateAuthIdToken,
      new Category().router
    );
    this.instance.use("/api/bill", validateAuthIdToken, new Bill().router);
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
