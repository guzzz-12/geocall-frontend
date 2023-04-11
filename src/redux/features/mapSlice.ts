import { createSlice } from "@reduxjs/toolkit";

export interface UserLocation {
  lat: number;
  lon: number;
};

export interface OnlineUser {
  socketId: string;
  userId: string;
  location: {
    lat: number;
    lon: number;
  }
};

interface LocationAction {
  type: string;
  payload: UserLocation;
};

interface OnlineUsersAction {
  type: string;
  payload: OnlineUser[];
};

export interface MapState {
  myLocation: UserLocation | null;
  onlineUsers: OnlineUser[];
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
    },
    setOnlineUsers: (state, action: OnlineUsersAction) => {
      state.onlineUsers = action.payload;
    }
  }
});

export const { setMyLocation, setOnlineUsers } = mapSlice.actions;
export const mapReducer = mapSlice.reducer;