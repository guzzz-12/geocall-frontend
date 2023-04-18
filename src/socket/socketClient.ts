import { Socket, io } from "socket.io-client";
import { UserLocation } from "../redux/features/mapSlice";
import { Message } from "../redux/features/chatsSlice";
import { Notification } from "../redux/features/notificationsSlice";
import { VideoCallData } from "../redux/features/videoCallSlice";

export enum SocketEvents {
  USER_RECONNECTED = "USER_RECONNECTED",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  GET_ONLINE_USERS = "GET_ONLINE_USERS",
  NEW_MESSAGE = "NEW_MESSAGE",
  DELETED_MESSAGE = "DELETED_MESSAGE",
  NEW_NOTIFICATION = "NEW_NOTIFICATION",
  INCOMING_CALL = "INCOMING_CALL",
  CALL_ENDED = "CALL_ENDED",
  CALL_REJECTED = "CALL_REJECTED",
  DISCONNECT = "DISCONNECT"
};

class SocketClient {
  private socketInstance: Socket;

  constructor() {
    // this.socketInstance = io("http://localhost:5000");
    this.socketInstance = io("http://192.168.0.114:5000");
  };

  userReconnected(userId: string, location: UserLocation, peerId: string) {
    this.socketInstance.emit(SocketEvents.USER_RECONNECTED, {userId, location, peerId})
  };

  userLogin(userId: string, location: UserLocation) {
    this.socketInstance.emit(SocketEvents.USER_LOGIN, {userId, location})
  };

  userLogout(userId: string) {
    this.socketInstance.emit(SocketEvents.USER_LOGOUT, {userId})
  };

  newMessage(message: Message) {
    this.socketInstance.emit(SocketEvents.NEW_MESSAGE, message)
  };

  newNotification(notification: Notification) {
    this.socketInstance.emit(SocketEvents.NEW_NOTIFICATION, notification)
  };

  videoCall(videoCall: VideoCallData) {
    this.socketInstance.emit(SocketEvents.INCOMING_CALL, videoCall);
  };

  get socket() {
    return this.socketInstance
  };

  userDisconnected() {
    this.socketInstance.emit(SocketEvents.DISCONNECT)
  };
};

const socket = new SocketClient();

export const socketClient = Object.freeze(socket);