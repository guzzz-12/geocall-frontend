import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";

export interface UserState {
  currentUser: User | null;
  isAuth: boolean;
  peerId: string | null;
  hasMediaDevice: boolean;
  status: "active" | "busy";
};

const initialState: UserState = {
  currentUser: null,
  isAuth: false,
  peerId: null,
  hasMediaDevice: false,
  status: "active"
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
    setUserStatus: (state, action: {type: string, payload: "active" | "busy"}) => {
      state.status = action.payload;
    }
  }
});

export const userReducer = userSlice.reducer;

export const {
  setCurrentUser,
  removeCurrentUser,
  setPeerId,
  setHasMediaDevice,
  setUserStatus
} = userSlice.actions;