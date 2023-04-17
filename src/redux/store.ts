import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { UserState, userReducer } from "./features/userSlice";
import { ChatsState, chatsReducer } from "./features/chatsSlice";
import { NotificationsState, notificationsReducer } from "./features/notificationsSlice";
import { VideoCallState, videoCallReducer } from "./features/videoCallSlice";
import { api } from "./api";

export interface MapRootState {
  map: MapState;
};

export interface UserRootState {
  user: UserState;
};

export interface ChatsRootState {
  chats: ChatsState;
};

export interface NotificationsRootState {
  notifications: NotificationsState
};

export interface VideoCallRootState {
  videoCall: VideoCallState
};

const store = configureStore({
  reducer: {
    map: mapReducer,
    user: userReducer,
    chats: chatsReducer,
    notifications: notificationsReducer,
    videoCall: videoCallReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoreActions: true
    }
  }).concat(api.middleware)
});

export default store;