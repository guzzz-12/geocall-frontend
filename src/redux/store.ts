import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { UserState, userReducer } from "./features/userSlice";
import { ChatsState, chatsReducer } from "./features/chatsSlice";
import { NotificationsState, notificationsReducer } from "./features/notificationsSlice";
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

const store = configureStore({
  reducer: {
    map: mapReducer,
    user: userReducer,
    chats: chatsReducer,
    notifications: notificationsReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});

export default store;