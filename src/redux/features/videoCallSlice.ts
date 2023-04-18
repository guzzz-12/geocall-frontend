import { createSlice } from "@reduxjs/toolkit";
import { MediaConnection } from "peerjs";

export interface VideoCallState {
  videoCall: MediaConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

const initialState: VideoCallState = {
  videoCall: null,
  localStream: null,
  remoteStream: null
};

const videoCallSlice = createSlice({
  name: "videoCall",
  initialState,
  reducers: {
    setVideoCall: (state, action: {type: string, payload: MediaConnection | null}) => {
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
