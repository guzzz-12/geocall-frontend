import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";

export interface UserState {
  currentuser: User | null;
  isAuth: boolean;
  peerId: string | null;
  hasMediaDevice: boolean;
};

const initialState: UserState = {
  currentuser: null,
  isAuth: false,
  peerId: null,
  hasMediaDevice: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: {type: string, payload: User}) => {
      state.isAuth = true;
      state.currentuser = action.payload;
      localStorage.setItem("token", action.payload.token);
    },
    removeCurrentUser: (state) => {
      state.isAuth = false;
      state.currentuser = null;
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