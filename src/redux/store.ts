import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { api } from "./api";

export interface MapRootState {
  map: MapState;
};

const store = configureStore({
  reducer: {
    map: mapReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});

export default store;