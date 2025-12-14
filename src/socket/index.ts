import { SocketService } from "../service/socket.service";
export const getIO = () => SocketService.getInstance().getIO();
export const getSocketService = () => SocketService.getInstance();
