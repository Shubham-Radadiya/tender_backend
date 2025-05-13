import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateAuthIdToken } from "../../../middleware/validateAuthUser";

const router = Router();
const chatController = new ChatController();

// Create a new chat
router.post("/", validateAuthIdToken, chatController.createChat);

// Get chat history
router.get("/:chatId", validateAuthIdToken, chatController.getChatHistory);

// Get all chats for a user
router.get("/user/chats", validateAuthIdToken, chatController.getUserChats);

export default router;
