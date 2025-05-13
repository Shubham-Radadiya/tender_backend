import { Chat, IChat } from "../models/chat.model";
import mongoose from "mongoose";
import { SocketService } from "../../socket/socket.service";

export class ChatService {
  private static instance: ChatService;
  private socketService: SocketService;

  private constructor() {
    this.socketService = SocketService.getInstance();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async createChat(participants: string[]): Promise<IChat> {
    try {
      const validParticipants = participants.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );

      const newChat = await Chat.create({
        participants: validParticipants,
        messages: [],
      });

      // Notify all participants about new chat
      participants.forEach((userId) => {
        this.socketService.emitToUser(userId, "new_chat", newChat);
      });

      return newChat;
    } catch (error) {
      throw error;
    }
  }

  async saveMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<IChat> {
    try {
      const message = {
        sender: new mongoose.Types.ObjectId(senderId),
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

      if (!updatedChat) {
        throw new Error("Chat not found");
      }

      return updatedChat;
    } catch (error) {
      throw error;
    }
  }

  async getChatHistory(chatId: string): Promise<IChat> {
    try {
      const chat = await Chat.findById(chatId)
        .populate("participants", "name email")
        .populate("messages.sender", "name email");

      if (!chat) {
        throw new Error("Chat not found");
      }

      return chat;
    } catch (error) {
      throw error;
    }
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    try {
      const chats = await Chat.find({ participants: userId })
        .populate("participants", "name email")
        .populate("messages.sender", "name email")
        .sort({ updatedAt: -1 });

      return chats;
    } catch (error) {
      throw error;
    }
  }
}
