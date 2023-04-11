import { createSlice } from "@reduxjs/toolkit";
import { User } from "../api";

export interface UserState {
  currentuser: User | null;
  isAuth: boolean;
};

const initialState: UserState = {
  currentuser: null,
  isAuth: false
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: {type: string, payload: User}) => {
      state.isAuth = true;
      state.currentuser = action.payload;
    },
    removeCurrentUser: (state) => {
      state.isAuth = false;
      state.currentuser = null;
    }
  }
});

export const userReducer = userSlice.reducer;
export const {setCurrentUser, removeCurrentUser} = userSlice.actions;