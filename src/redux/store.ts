import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";

export interface MapRootState {
  map: MapState;
};

const store = configureStore({
  reducer: {
    map: mapReducer
  }
});

export default store;