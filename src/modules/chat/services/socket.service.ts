import { Chat } from "../models/chat.model";
import { Socket } from "socket.io";

export class SocketService {
  private static instance: SocketService;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
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

  async saveMessage(chatId: string, senderId: string, content: string) {
    try {
      const message = {
        sender: senderId,
        content,
        timestamp: new Date(),
      };

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      ).populate("messages.sender", "name email");

      return updatedChat;
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  async getUserChats(userId: string) {
    try {
      const chats = await Chat.find({ participants: userId })
        .populate("participants", "name email")
        .populate("messages.sender", "name email")
        .sort({ updatedAt: -1 });
      return chats;
    } catch (error) {
      console.error("Error fetching user chats:", error);
      throw error;
    }
  }
}
