import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";

export interface UserLocation {
  lat: number;
  lon: number;
};

export interface OnlineUser {
  socketId: string;
  userId: string;
  location: UserLocation
};

interface LocationAction {
  type: string;
  payload: UserLocation;
};

interface OnlineUsersAction {
  type: string;
  payload: OnlineUser[];
};

export interface SelectedUser {
  user: User;
  location: UserLocation,
  distance: string;
};

export interface MapState {
  myLocation: UserLocation | null;
  onlineUsers: OnlineUser[];
  selectedUser: SelectedUser | null;
};

const initialState: MapState = {
  myLocation: null,
  onlineUsers: [],
  selectedUser: null
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
    },
    setSelectedUser: (state, action: {type: string, payload: SelectedUser}) => {
      state.selectedUser = action.payload;
    }
  }
});

export const { setMyLocation, setOnlineUsers, setSelectedUser } = mapSlice.actions;
export const mapReducer = mapSlice.reducer;