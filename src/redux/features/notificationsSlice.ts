import { createSlice } from "@reduxjs/toolkit";

export interface Notification {
  notificationId: string;
  notificationType: "incomingMessage" | "incomingVideocall";
  senderId: string;
  senderData: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  senderSocketId: string;
  receiverId: string;
  receiverSocketId: string;
  unread: boolean;
};

export interface NotificationsState {
  unread: Notification[];
  all: Notification[];
};

const initialState: NotificationsState = {
  unread: [],
  all: []
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action: {type: string, payload: Notification}) => {
      state.all = [action.payload, ...state.all];
      state.unread = [action.payload, ...state.unread];
    },
    setReadNotifications: (state) => {
      const readNotifications = [...state.all].map((notification) => {
        notification.unread = false;
        return notification;
      });

      state.all = readNotifications;
      state.unread = [];
    }
  }
});

export const notificationsReducer = notificationsSlice.reducer;
export const { setNotifications, setReadNotifications } = notificationsSlice.actions;