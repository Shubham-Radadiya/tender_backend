import mongoose, { Schema, Document } from "mongoose";

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

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
