import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChatRoomModel, MessageModel } from "../chat/models";

export class SocketService {
  private static instance: SocketService;
  private io: Server<DefaultEventsMap>;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
    return this;
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("New client connected:", socket.id);

      // Handle user connection
      socket.on("user:connect", (userId: string) => {
        this.handleUserConnection(socket, userId);
      });

      // Handle joining chat rooms
      socket.on("room:join", (roomId: string) => {
        this.handleJoinRoom(socket, roomId);
      });

      // Handle leaving chat rooms
      socket.on("room:leave", (roomId: string) => {
        this.handleLeaveRoom(socket, roomId);
      });

      // Handle new messages
      socket.on(
        "message:send",
        async (data: { roomId: string; content: string; type: string }) => {
          await this.handleNewMessage(socket, data);
        }
      );

      // Handle message read status
      socket.on(
        "message:read",
        async (data: { roomId: string; messageId: string }) => {
          await this.handleMessageRead(socket, data);
        }
      );

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handleDisconnection(socket);
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
  getIO(): Server {
    return this.io;
  }

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
}
