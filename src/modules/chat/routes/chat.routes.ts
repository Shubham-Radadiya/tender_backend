import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { validateAuthIdToken } from "../../../middleware/validateAuthUser";

const router = Router();
const chatController = new ChatController();

// Create a new chat room
router.post("/rooms", validateAuthIdToken, chatController.createChatRoom);

// Get user's chat rooms with unread counts
router.get("/rooms", validateAuthIdToken, chatController.getUserRooms);

// Get room messages with pagination
router.get(
  "/rooms/:roomId/messages",
  validateAuthIdToken,
  chatController.getRoomMessages
);

// Mark message as read
router.put(
  "/messages/:messageId/read",
  validateAuthIdToken,
  chatController.markMessageAsRead
);

export default router;
