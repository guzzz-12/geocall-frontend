import { Socket, io } from "socket.io-client";
import { UserAvailability, UserLocation } from "../redux/features/mapSlice";
import { Message } from "../redux/features/chatsSlice";
import { Notification } from "../redux/features/notificationsSlice";
import { VideoCallData } from "../redux/features/videoCallSlice";

export enum SocketEvents {
  SERVER_RESTARTED = "SERVER_RESTARTED",
  USER_RECONNECTED = "USER_RECONNECTED",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  GET_ONLINE_USERS = "GET_ONLINE_USERS",
  NEW_MESSAGE = "NEW_MESSAGE",
  TYPING = "TYPING",
  DELETED_MESSAGE = "DELETED_MESSAGE",
  NEW_NOTIFICATION = "NEW_NOTIFICATION",
  INCOMING_CALL = "INCOMING_CALL",
  CALL_ACCEPTED = "CALL_ACCEPTED",
  CALL_ENDED = "CALL_ENDED",
  CALL_REJECTED = "CALL_REJECTED",
  CALL_USER_UNAVAILABLE = "CALL_USER_UNAVAILABLE",
  SET_USER_AVAILABILITY = "SET_USER_AVAILABILITY",
  DISCONNECT = "DISCONNECT"
};

const IS_DEV = import.meta.env.DEV;
const socketUrl = IS_DEV ? "http://localhost:5000" : import.meta.env.VITE_PRODUCTION_URL;

class SocketClient {
  private socketInstance: Socket;

  constructor() {
    this.socketInstance = io(socketUrl);
  };

  userReconnected(userId: string, location: UserLocation, peerId: string) {
    this.socketInstance.emit(SocketEvents.USER_RECONNECTED, {userId, location, peerId})
  };

  userLogout(userId: string) {
    this.socketInstance.emit(SocketEvents.USER_LOGOUT, {userId})
  };

  newMessage(message: Message) {
    this.socketInstance.emit(SocketEvents.NEW_MESSAGE, message)
  };

  deletedMessage(userId: string, chatId: string, messageId: string) {
    this.socketInstance.emit(SocketEvents.DELETED_MESSAGE, {userId, chatId, messageId})
  };

  newNotification(notification: Notification) {
    this.socketInstance.emit(SocketEvents.NEW_NOTIFICATION, notification)
  };

  videoCall(videoCall: VideoCallData) {
    this.socketInstance.emit(SocketEvents.INCOMING_CALL, videoCall);
  };

  userCallUnavailable(remitentId: string) {
    this.socketInstance.emit(SocketEvents.CALL_USER_UNAVAILABLE, remitentId)
  };

  setUserAvailability(userId: string, availability: UserAvailability) {
    this.socketInstance.emit(SocketEvents.SET_USER_AVAILABILITY, {userId, availability})
  };

  get socket() {
    return this.socketInstance
  };

  get socketId() {
    return this.socketInstance.id
  };

  userDisconnected() {
    this.socketInstance.emit(SocketEvents.DISCONNECT)
  };
};

const socket = new SocketClient();

export const socketClient = Object.freeze(socket);