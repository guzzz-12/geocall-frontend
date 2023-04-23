import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";
import { UserAvailability } from "./mapSlice";

export interface UserState {
  currentUser: User | null;
  isAuth: boolean;
  peerId: string | null;
  hasMediaDevice: boolean;
  videoCallStatus: "active" | "busy";
  chatStatus: UserAvailability;
};

const initialState: UserState = {
  currentUser: null,
  isAuth: false,
  peerId: null,
  hasMediaDevice: false,
  videoCallStatus: "active",
  chatStatus: "available"
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: {type: string, payload: User}) => {
      state.isAuth = true;
      state.currentUser = action.payload;
      localStorage.setItem("token", action.payload.token);
    },
    removeCurrentUser: (state) => {
      state.isAuth = false;
      state.currentUser = null;
      localStorage.clear();
    },
    setPeerId: (state, action: {type: string, payload: string | null}) => {
      state.peerId = action.payload;
    },
    setHasMediaDevice: (state, action: {type: string, payload: boolean}) => {
      state.hasMediaDevice = action.payload;
    },
    setUserVideoCallStatus: (state, action: {type: string, payload: "active" | "busy"}) => {
      state.videoCallStatus = action.payload;
    },
    setChatStatus: (state, action: {type: string, payload: UserAvailability}) => {
      state.chatStatus = action.payload;
    }
  }
});

export const userReducer = userSlice.reducer;

export const {
  setCurrentUser,
  removeCurrentUser,
  setPeerId,
  setHasMediaDevice,
  setUserVideoCallStatus,
  setChatStatus
} = userSlice.actions;