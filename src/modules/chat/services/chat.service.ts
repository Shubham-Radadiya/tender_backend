import mongoose from "mongoose";
import { ChatRoomModel, IChatRoom, MessageModel, IMessage } from "../models";
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

  async createChatRoom(
    participants: string[],
    name: string,
    type: "private" | "group" = "private"
  ): Promise<IChatRoom> {
    try {
      const validParticipants = participants.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      const newRoom = await ChatRoomModel.create({
        name,
        participants: validParticipants,
        type,
      });

      participants.forEach((userId) => {
        this.socketService.emitToUser(userId, "room:new", newRoom);
      });

      return newRoom;
    } catch (error) {
      throw error;
    }
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    type: "text" | "image" | "file" = "text"
  ): Promise<IMessage> {
    try {
      const message = await MessageModel.create({
        roomId: new mongoose.Types.ObjectId(roomId),
        sender: new mongoose.Types.ObjectId(senderId),
        content,
        type,
        readBy: [new mongoose.Types.ObjectId(senderId)],
      });

      // Update last message in chat room
      await ChatRoomModel.findByIdAndUpdate(roomId, {
        lastMessage: message._id,
      });

      // Emit to room
      this.socketService.emitToRoom(roomId, "message:new", message);

      return message;
    } catch (error) {
      throw error;
    }
  }

  async getRoomMessages(
    roomId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        MessageModel.find({ roomId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("sender", "name email")
          .populate("readBy", "name email"),
        MessageModel.countDocuments({ roomId }),
      ]);

      return { messages, total };
    } catch (error) {
      throw error;
    }
  }

  async getUserRooms(userId: string): Promise<IChatRoom[]> {
    try {
      const rooms = await ChatRoomModel.find({ participants: userId })
        .populate("participants", "firstName lastName email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async markMessageAsRead(
    messageId: string,
    userId: string
  ): Promise<IMessage> {
    try {
      const message = await MessageModel.findByIdAndUpdate(
        messageId,
        {
          $addToSet: { readBy: new mongoose.Types.ObjectId(userId) },
        },
        { new: true }
      ).populate("readBy", "name email");

      if (!message) {
        throw new Error("Message not found");
      }

      return message;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadMessageCount(
    userId: string
  ): Promise<{ [roomId: string]: number }> {
    try {
      const rooms = await ChatRoomModel.find({ participants: userId });
      const unreadCounts: { [roomId: string]: number } = {};

      for (const room of rooms) {
        const count = await MessageModel.countDocuments({
          roomId: room._id,
          readBy: { $ne: new mongoose.Types.ObjectId(userId) },
        });
        unreadCounts[room._id.toString()] = count;
      }

      return unreadCounts;
    } catch (error) {
      throw error;
    }
  }
}
