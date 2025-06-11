import { Schema } from "mongoose";

export const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "ChatRoom",
    required: true,
  },
  readBy: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
