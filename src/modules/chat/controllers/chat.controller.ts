import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = ChatService.getInstance();
  }

  createChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { participants } = req.body;
      const chat = await this.chatService.createChat(participants);
      res.status(201).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error creating chat",
      });
    }
  };

  getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const chat = await this.chatService.getChatHistory(chatId);
      res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching chat history",
      });
    }
  };

  getUserChats = async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const chats = await this.chatService.getUserChats(userId);
      res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || "Error fetching user chats",
      });
    }
  };
}
