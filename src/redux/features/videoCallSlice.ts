import { createSlice } from "@reduxjs/toolkit";

export interface VideoCallState {
  videoCall: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

const initialState: VideoCallState = {
  videoCall: false,
  localStream: null,
  remoteStream: null
};

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState,
  reducers: {
    setVideoCall: (state, action: {type: string, payload: boolean}) => {
      state.videoCall = action.payload;
    },
    setLocalStream: (state, action: {type: string, payload: MediaStream | null}) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: {type: string, payload: MediaStream | null}) => {
      state.remoteStream = action.payload;
    }
  }
});

export const videoCallReducer = videoCallSlice.reducer;
export const {setVideoCall, setLocalStream, setRemoteStream} = videoCallSlice.actions;
