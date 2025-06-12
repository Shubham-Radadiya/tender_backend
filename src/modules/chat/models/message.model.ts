import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  roomId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  replayTo: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "image" | "file";
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
