import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../api";
import { UserAvailability } from "./mapSlice";

export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  isAuth: boolean;
  peerId: string | null;
  hasMediaDevice: boolean;
  videoCallStatus: "active" | "busy";
  chatStatus: UserAvailability;
  isDisconnected: boolean;
};

const initialState: UserState = {
  currentUser: null,
  isLoading: true,
  isAuth: false,
  peerId: null,
  hasMediaDevice: false,
  videoCallStatus: "active",
  chatStatus: "available",
  isDisconnected: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.isAuth = true;
      state.currentUser = action.payload;
      state.isLoading = false;
      localStorage.setItem("token", action.payload.token);
    },
    removeCurrentUser: (state) => {
      state.isAuth = false;
      state.currentUser = null;
      localStorage.clear();
    },
    setPeerId: (state, action: PayloadAction<string | null>) => {
      state.peerId = action.payload;
    },
    setHasMediaDevice: (state, action: PayloadAction<boolean>) => {
      state.hasMediaDevice = action.payload;
    },
    setUserVideoCallStatus: (state, action: PayloadAction<"active" | "busy">) => {
      state.videoCallStatus = action.payload;
    },
    setChatStatus: (state, action: PayloadAction<UserAvailability>) => {
      state.chatStatus = action.payload;
    },
    setIsLoadingUser: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsDisconnected: (state, action: PayloadAction<boolean>) => {
      state.isDisconnected = action.payload
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
  setChatStatus,
  setIsLoadingUser,
  setIsDisconnected
} = userSlice.actions;