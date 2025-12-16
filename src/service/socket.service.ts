import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChatRoomModel, MessageModel } from "../modules/chat/models";
import mongoose, { Types } from "mongoose";
import { createMessage } from "../modules/chat/model";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import registerNotificationEvents from "../socket/events/notificationEvents";
export class SocketService {
  private static instance: SocketService;
  private io: Server<DefaultEventsMap>;
  private httpServer: HttpServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(httpServer: HttpServer) {
    this.httpServer = httpServer;
    this.io = new Server(this.httpServer, {
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
    this.io.use((socket, next) => {
      let token = socket.handshake.auth.token;
      if (!token && socket.handshake.query?.["auth.token"]) {
        token = socket.handshake.query["auth.token"] as string;
      }

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

    this.setupSocketHandlers();
    return this;
  }

  public getIO(): Server {
    return this.io;
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      registerNotificationEvents(this.io, socket);
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
            roomId: new Types.ObjectId(String(roomId)),
          })
            .populate("sender", "name email")
            .populate("replyTo", "roomId content")
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
        async (data: { roomId: string; content: string; replyTo: any }) => {
          try {
            console.log("send_message::data ==>", data);
            const { roomId, content, replyTo } = data;
            console.log("replyTo ==>", replyTo);
            const sender = socket.data.user.userId;

            if (!roomId || !content || !sender) {
              throw new Error(
                "Missing required fields: roomId, content, or sender"
              );
            }

            let replyToId: mongoose.Types.ObjectId | undefined;

            if (replyTo?._id && Types.ObjectId.isValid(replyTo._id)) {
              replyToId = new Types.ObjectId(replyTo._id);
            }

            const message = await createMessage(
              new Types.ObjectId(String(sender)),
              content,
              new Types.ObjectId(roomId),
              replyToId
            );
            console.log("Message saved:", message);

            this.io.to(roomId).emit("message_received", {
              content: message.content,
              sender: message.sender,
              timestamp: message.timestamp,
            });
            // Fetch and emit room messages
            const messages = await MessageModel.find({
              roomId: new Types.ObjectId(roomId),
            })
              .populate("sender", "name email")
              .populate("replyTo")
              .sort({ timestamp: -1 });
            socket.emit("room_messages", messages);
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

          this.io
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
  }

  private handleUserConnection(socket: Socket, userId: string) {
    this.connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
    const userId = this.getUserIdBySocketId(socket.id);
    if (userId) {
      if (!this.userRooms.has(userId)) {
        this.userRooms.set(userId, new Set());
      }
      this.userRooms.get(userId)?.add(roomId);

      // Get message history
      this.getRoomMessages(roomId).then((messages) => {
        socket.emit("message:history", messages);
      });

      // Notify others about new user
      socket.to(roomId).emit("user:joined", {
        userId,
        socketId: socket.id,
      });

      // Get connected users in room
      this.getConnectedUsersInRoom(roomId).then((users) => {
        socket.emit("room:users", users);
      });
    }
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  }

  private handleLeaveRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
    const userId = this.getUserIdBySocketId(socket.id);
    if (userId) {
      this.userRooms.get(userId)?.delete(roomId);
    }
    console.log(`Socket ${socket.id} left room ${roomId}`);
  }

  private async handleNewMessage(
    socket: Socket,
    data: { roomId: string; content: string; type: string }
  ) {
    try {
      const userId = this.getUserIdBySocketId(socket.id);
      if (!userId) return;

      const message = await MessageModel.create({
        roomId: data.roomId,
        sender: userId,
        content: data.content,
        type: data.type,
        readBy: [userId],
      });

      // Update last message in chat room
      await ChatRoomModel.findByIdAndUpdate(data.roomId, {
        lastMessage: message._id,
      });

      // Emit to room
      this.io.to(data.roomId).emit("message:new", message);

      // Notify participants who are not in the room
      const room = await ChatRoomModel.findById(data.roomId).populate(
        "participants"
      );
      if (room) {
        room.participants.forEach((participant: any) => {
          if (participant._id.toString() !== userId) {
            this.emitToUser(
              participant._id.toString(),
              "message:notification",
              {
                roomId: data.roomId,
                message: message,
              }
            );
          }
        });
      }
    } catch (error) {
      console.error("Error handling new message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  }

  private async handleMessageRead(
    socket: Socket,
    data: { roomId: string; messageId: string }
  ) {
    try {
      const userId = this.getUserIdBySocketId(socket.id);
      if (!userId) return;

      await MessageModel.findByIdAndUpdate(data.messageId, {
        $addToSet: { readBy: userId },
      });

      this.io.to(data.roomId).emit("message:read", {
        messageId: data.messageId,
        readBy: userId,
      });
    } catch (error) {
      console.error("Error handling message read:", error);
      socket.emit("error", { message: "Error updating message read status" });
    }
  }

  private handleDisconnection(socket: Socket) {
    const userId = this.getUserIdBySocketId(socket.id);
    if (userId) {
      // Notify all rooms user was in
      const userRooms = this.userRooms.get(userId);
      if (userRooms) {
        userRooms.forEach((roomId) => {
          socket.to(roomId).emit("user:left", {
            userId,
            socketId: socket.id,
          });
        });
      }

      this.connectedUsers.delete(userId);
      this.userRooms.delete(userId);
    }
    console.log("Client disconnected:", socket.id);
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, sid] of this.connectedUsers.entries()) {
      if (sid === socketId) return userId;
    }
    return undefined;
  }

  // Public methods for external use
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  broadcastToAll(socket: Socket, event: string, data: any) {
    socket.broadcast.emit(event, data);
  }

  private async getRoomMessages(roomId: string) {
    try {
      return await MessageModel.find({ roomId })
        .sort({ createdAt: 1 })
        .populate("sender", "name email")
        .lean();
    } catch (error) {
      console.error("Error fetching room messages:", error);
      return [];
    }
  }

  private async getConnectedUsersInRoom(roomId: string) {
    const users = [];
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      const userRooms = this.userRooms.get(userId);
      if (userRooms?.has(roomId)) {
        users.push({ userId, socketId });
      }
    }
    return users;
  }
}
