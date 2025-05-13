import mongoose, { Document } from "mongoose";
import { chatSchema } from "./schema";

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);

export const createChat = async (
  participants: mongoose.Types.ObjectId[]
): Promise<IChat> => {
  return await ChatModel.create({ participants, messages: [] });
};

export const getChatById = async (chatId: string): Promise<IChat | null> => {
  return await ChatModel.findById(chatId)
    .populate("participants", "name email")
    .populate("messages.sender", "name email");
};

export const getUserChats = async (userId: string): Promise<IChat[]> => {
  return await ChatModel.find({ participants: userId })
    .populate("participants", "name email")
    .populate("messages.sender", "name email")
    .sort({ updatedAt: -1 });
};

export const addMessageToChat = async (
  chatId: string,
  message: IMessage
): Promise<IChat | null> => {
  return await ChatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  ).populate("messages.sender", "name email");
};
