import { createSlice } from "@reduxjs/toolkit";

export interface GlobalAlertState {
  isOpen: boolean;
  message: string | null;
};

const initialState: GlobalAlertState = {
  isOpen: false,
  message: null
};

const globalAlertSlice = createSlice({
  name: "globalAlert",
  initialState,
  reducers: {
    openAlert: (state, action: {type: string, payload: {message: string}}) => {
      state.isOpen = true;
      state.message = action.payload.message;
    },
    closeAlert: (state) => {
      state.isOpen = false;
      setTimeout(() => {
        state.message = null
      }, 1500);
    }
  }
});

export const globalAlertReducer = globalAlertSlice.reducer;
export const {closeAlert, openAlert} = globalAlertSlice.actions;