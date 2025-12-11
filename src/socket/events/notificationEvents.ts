import { Server, Socket } from "socket.io";

export default function registerNotificationEvents(io: Server, socket: Socket) {
  socket.on("notification:join", (userId: string) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined notification room: ${userId}`);
  });

  socket.on("notification:read", async (notificationId: string) => {
    io.emit("notification:read:update", notificationId);
  });
}
