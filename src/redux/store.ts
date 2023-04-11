import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { UserState, userReducer } from "./features/userSlice";
import { api } from "./api";

export interface MapRootState {
  map: MapState;
};

export interface UserRootState {
  user: UserState;
};

const store = configureStore({
  reducer: {
    map: mapReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});

export default store;