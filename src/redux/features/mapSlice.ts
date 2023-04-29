import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";

export interface UserLocation {
  lat: number;
  lon: number;
};

export type UserAvailability = "available" | "unavailable";

export interface OnlineUser {
  userId: string;
  peerId: string;
  status: UserAvailability;
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
  peerId: string;
  address: string;
  location: UserLocation;
  distance: string;
};

export interface MapState {
  myLocation: UserLocation | null;
  onlineUsers: OnlineUser[];
  selectedUser: SelectedUser | null;
  selectedUserPrefetch: {
    selectedUserId: string | null
  }
};

const initialState: MapState = {
  myLocation: null,
  onlineUsers: [],
  selectedUser: null,
  selectedUserPrefetch: {
    selectedUserId: null
  }
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
    setSelectedUserPrefetch: (state, action: {type: string, payload: {selectedUserId: string | null}}) => {
      state.selectedUserPrefetch = action.payload;
    },
    setSelectedUser: (state, action: {type: string, payload: SelectedUser | null}) => {
      state.selectedUser = action.payload;
    },
    clearMapState: (state) => {
      state.onlineUsers = [];
      state.selectedUser = null;
      state.selectedUserPrefetch = {selectedUserId: null};
    }
  }
});

export const mapReducer = mapSlice.reducer;
export const {
  setMyLocation,
  setOnlineUsers,
  setSelectedUserPrefetch,
  setSelectedUser,
  clearMapState
} = mapSlice.actions;