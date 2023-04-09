import { createSlice } from "@reduxjs/toolkit";

export interface UserLocation {
  lat: number;
  lon: number;
}

interface LocationAction {
  type: string;
  payload: UserLocation;
};

export interface MapState {
  myLocation: UserLocation | null;
  onlineUsers: any[];
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
    } 
  }
});

export const {setMyLocation} = mapSlice.actions;
export const mapReducer = mapSlice.reducer;