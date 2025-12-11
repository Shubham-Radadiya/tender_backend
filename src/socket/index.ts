import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import registerNotificationEvents from "./events/notificationEvents";

let io: Server;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerNotificationEvents(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export const socket = io;
export const getIO = () => io;
