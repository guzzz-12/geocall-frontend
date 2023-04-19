import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";
import { socketClient } from "../../socket/socketClient";

export interface UserState {
  currentUser: User | null;
  isAuth: boolean;
  socketId: string;
  peerId: string | null;
  hasMediaDevice: boolean;
};

const initialState: UserState = {
  currentUser: null,
  isAuth: false,
  socketId: "",
  peerId: null,
  hasMediaDevice: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: {type: string, payload: User}) => {
      state.isAuth = true;
      state.currentUser = action.payload;
      state.socketId = socketClient.socketId;
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
    }
  }
});

export const userReducer = userSlice.reducer;

export const {
  setCurrentUser,
  removeCurrentUser,
  setPeerId,
  setHasMediaDevice
} = userSlice.actions;