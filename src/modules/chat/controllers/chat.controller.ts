import { Response } from "express";
import { Request } from "../../../request";
import { ChatService } from "../services/chat.service";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = ChatService.getInstance();
  }

  createChatRoom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { participants, name, type } = req.body;
      const room = await this.chatService.createChatRoom(
        participants,
        name,
        type
      );
      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error creating chat room",
      });
    }
  };

  getRoomMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const result = await this.chatService.getRoomMessages(
        roomId,
        Number(page),
        Number(limit)
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching room messages",
      });
    }
  };

  getUserRooms = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.authUser?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const rooms = await this.chatService.getUserRooms(userId);
      const unreadCounts = await this.chatService.getUnreadMessageCount(userId);

      res.status(200).json({
        success: true,
        data: {
          rooms,
          unreadCounts,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching user rooms",
      });
    }
  };

  markMessageAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.authUser?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const message = await this.chatService.markMessageAsRead(
        messageId,
        userId
      );
      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error marking message as read",
      });
    }
  };
}
