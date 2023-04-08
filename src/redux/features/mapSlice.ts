import { createSlice } from "@reduxjs/toolkit";

interface LocationAction {
  type: string;
  payload: [number, number];
};

export interface MapState {
  myLocation: [number, number] | null;
  onlineUsers: any[];
  cardChosenOption: any;
};

const initialState: MapState = {
  myLocation: null,
  onlineUsers: [],
  cardChosenOption: null
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMyLocation: (state, action: LocationAction) => {
      state.myLocation = action.payload;
    } 
  }
});

export const {setMyLocation} = mapSlice.actions;
export const mapReducer = mapSlice.reducer;