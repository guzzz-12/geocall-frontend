import { configureStore } from "@reduxjs/toolkit";
import { mapReducer } from "./features/mapSlice";

export interface MapState {
  map: MapState
};

const store = configureStore({
  reducer: {
    map: mapReducer
  }
});

export default store;