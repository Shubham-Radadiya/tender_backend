import App from "./app";
import { connectDb } from "./dbConnection";
import { Server } from "socket.io";
import { createServer } from "http";
import * as dotenv from "dotenv";
import { SocketService } from "./modules/chat/services/socket.service";
import jwt from "jsonwebtoken";
dotenv.config();

const serverPort = process.env.PORT || 3000;

connectDb()
  .then(async () => {
    // Initialize Express app
    App.start(serverPort);
    const app = App.instance;

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO with separate namespace
    const io = new Server(httpServer, {
      cors: {
        origin: "*", // Update this with your frontend URL in production
        methods: ["GET", "POST"],
      },
      path: "/socket.io/", // Explicitly set Socket.IO path
    });

    // Socket authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    // Socket.IO connection handling
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
      const socketService = SocketService.getInstance();
      const userId = socket.data.user._id;

      // Store user connection
      socketService.addConnectedUser(userId, socket.id);

      // Join user's chats
      socket.on("join_chats", async (chatIds: string[]) => {
        chatIds.forEach((chatId) => {
          socket.join(chatId);
          console.log(`User ${userId} joined chat: ${chatId}`);
        });
      });

      // Handle new messages
      socket.on(
        "send_message",
        async (data: { chatId: string; content: string }) => {
          try {
            const { chatId, content } = data;

            // Save message to database
            const updatedChat = await socketService.saveMessage(
              chatId,
              userId,
              content
            );

            // Broadcast message to chat room
            io.to(chatId).emit("receive_message", {
              chatId,
              message: updatedChat.messages[updatedChat.messages.length - 1],
            });
          } catch (error) {
            socket.emit("error", "Failed to send message");
          }
        }
      );

      // Handle typing status
      socket.on("typing_start", (chatId: string) => {
        socket.to(chatId).emit("user_typing", { userId, chatId });
      });

      socket.on("typing_stop", (chatId: string) => {
        socket.to(chatId).emit("user_stopped_typing", { userId, chatId });
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        socketService.removeConnectedUser(userId);
        console.log("User disconnected:", socket.id);
      });
    });

    // Start the server
    httpServer.listen(serverPort, () => {
      console.log(
        `Server running on port ${serverPort} (${process.env.NODE_ENV})`
      );
      console.log(`Socket.IO listening on path: /socket.io/`);
    });
  })
  .catch((error) => {
    console.log("Error while connecting to database:", error);
  });
