import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketService } from "./modules/socket/socket.service";
import { validateAuthIdToken } from "./middleware/validateAuthUser";
import mongoose, { Types } from "mongoose";
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
import { MessageModel, createMessage } from "./modules/chat/model";
import Tender from "./controllers/tender";
import TenderQuotation from "./controllers/tenderQuotation";
import Company from "./controllers/company";
import Image from "./controllers/image";
import Notification from "./controllers/notification";

configDotenv();

export default class App {
  private static instance: express.Application;
  private static httpServer: any;
  private static io: Server;

  private constructor() { }

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
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      transports: ["polling", "websocket"],
      path: "/socket.io/",
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000,
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

      socket.on("join_room", async (data, callback) => {
        try {
          const { roomId } = data;
          console.log("roomId ==>", roomId);
          if (!roomId) {
            if (typeof callback === "function") {
              callback({ error: "Room ID is required" });
            }
            return;
          }
          socket.join(roomId);
          console.log(`Socket ${socket.id} joined room ${roomId}`);

          // Fetch and emit room messages
          const messages = await MessageModel.find({
            roomId: new Types.ObjectId(roomId),
          })
            .populate("sender", "name email")
            .sort({ timestamp: -1 });
          socket.emit("room_messages", messages);

          if (typeof callback === "function") {
            callback({ success: true, roomId });
          }
        } catch (error) {
          console.error("Error joining room:", error);
          if (typeof callback === "function") {
            callback({ error: "Failed to join room" });
          }
        }
      });

      socket.on(
        "send_message",
        async (data: { roomId: string; content: string }) => {
          try {
            const { roomId, content } = data;
            const sender = socket.data.user.userId;

            if (!roomId || !content || !sender) {
              throw new Error(
                "Missing required fields: roomId, content, or sender"
              );
            }

            const message = await createMessage(
              new mongoose.Types.ObjectId(sender),
              content,
              new mongoose.Types.ObjectId(roomId)
            );
            console.log("Message saved:", message);

            App.io.to(roomId).emit("message_received", {
              content: message.content,
              sender: message.sender,
              timestamp: message.timestamp,
            });
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        }
      );

      socket.on("mark_as_read", async (data: { messageId: string }) => {
        try {
          const { messageId } = data;
          const userId = socket.data.user.userId;

          const message = await MessageModel.findById(messageId);
          if (!message) {
            throw new Error("Message not found");
          }

          if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
            await message.save();
          }

          App.io
            .to(message.roomId.toString())
            .emit("message_read", { messageId, readBy: message.readBy });
        } catch (error) {
          console.error("Error marking message as read:", error);
          socket.emit("error", { message: "Failed to mark message as read" });
        }
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
    this.instance.use("/users", validateAuthIdToken, new User().router);
    this.instance.use("/chat", validateAuthIdToken, new Chat().router);
    this.instance.use("/category", validateAuthIdToken, new Category().router);
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
      "/partyWork",
      validateAuthIdToken,
      new PartyWork().router
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
