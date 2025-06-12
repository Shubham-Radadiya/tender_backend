import mongoose, { Document } from "mongoose";
import { messageSchema } from "./schema";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  roomId: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  timestamp: Date;
}

let MessageModel: mongoose.Model<IMessage>;

try {
  MessageModel = mongoose.model<IMessage>("Message");
} catch (error) {
  MessageModel = mongoose.model<IMessage>("Message", messageSchema);
}

export { MessageModel };

export const createMessage = async (
  sender: mongoose.Types.ObjectId,
  content: string,
  roomId: mongoose.Types.ObjectId,
  replayTo?: mongoose.Types.ObjectId
): Promise<IMessage> => {
  return await MessageModel.create({
    sender,
    content,
    roomId,
    replayTo,
    timestamp: new Date(),
  });
};

export const getMessagesBySender = async (
  senderId: string
): Promise<IMessage[]> => {
  return await MessageModel.find({ sender: senderId })
    .populate("sender", "name email")
    .sort({ timestamp: -1 });
};

export const getAllMessages = async (): Promise<IMessage[]> => {
  return await MessageModel.find()
    .populate("sender", "name email")
    .sort({ timestamp: -1 });
};
