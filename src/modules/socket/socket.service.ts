import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChatService } from "../chat/services/chat.service";

export class SocketService {
  private static instance: SocketService;
  private io: Server<DefaultEventsMap>;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(io: Server) {
    this.io = io;
    return this;
  }

  addConnectedUser(userId: string, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  removeConnectedUser(userId: string) {
    this.connectedUsers.delete(userId);
  }

  getConnectedUser(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  getIO(): Server {
    return this.io;
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Emit to room (chat)
  emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // Broadcast to all except sender
  broadcastToAll(socket: Socket, event: string, data: any) {
    socket.broadcast.emit(event, data);
  }
}
