import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { UserState, userReducer } from "./features/userSlice";
import { ChatsState, chatsReducer } from "./features/chatsSlice";
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

const store = configureStore({
  reducer: {
    map: mapReducer,
    user: userReducer,
    chats: chatsReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});

export default store;