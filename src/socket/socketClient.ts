import { Socket, io } from "socket.io-client";
import { UserLocation } from "../redux/features/mapSlice";

export enum SocketEvents {
  USER_RECONNECTED = "USER_RECONNECTED",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  DISCONNECT = "DISCONNECT"
};

class SocketClient {
  private socketInstance: Socket;

  constructor() {
    this.socketInstance = io("http://localhost:5000");
  };

  userConnected(userId: string) {
    this.socketInstance.emit(SocketEvents.USER_RECONNECTED, {userId})
  };

  userLogin(userId: string, location: UserLocation) {
    this.socketInstance.emit(SocketEvents.USER_LOGIN, {userId, location})
  };

  userLogout(userId: string) {
    this.socketInstance.emit(SocketEvents.USER_LOGOUT, {userId})
  };

  userDisconnected() {
    this.socketInstance.emit(SocketEvents.DISCONNECT)
  };
};

const socket = new SocketClient();

export const socketClient = Object.freeze(socket);