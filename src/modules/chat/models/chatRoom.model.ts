import mongoose, { Schema, Document } from "mongoose";

export interface IChatRoom extends Document {
  name: string;
  participants: mongoose.Types.ObjectId[];
  type: "private" | "group";
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

export const ChatRoomModel = mongoose.model<IChatRoom>(
  "ChatRoom",
  chatRoomSchema
);
