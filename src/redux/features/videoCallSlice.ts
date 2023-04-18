import { createSlice } from "@reduxjs/toolkit";
import { MediaConnection } from "peerjs";

export interface VideoCallState {
  videoCall: MediaConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  activeCallWith: ActiveCallWith | null;
};

export interface VideoCallData {
  remitent: {
    id: string;
    socketId: string;
    firstName: string;
    avatar: string;
    username: string;
  };
  recipient: {
    id: string;
    socketId: string;
    firstName: string;
    avatar: string;
    username: string;
  }
}

export interface ActiveCallWith {
  id: string;
  socketId: string;
  firstName: string;
  avatar: string;
  username: string;
};

const initialState: VideoCallState = {
  videoCall: null,
  localStream: null,
  remoteStream: null,
  activeCallWith: null
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
    },
    setActiveVideoCallData: (state, action: {type:string, payload: ActiveCallWith | null}) => {
      state.activeCallWith = action.payload;
    }
  }
});

export const videoCallReducer = videoCallSlice.reducer;
export const {
  setVideoCall,
  setLocalStream,
  setRemoteStream,
  setActiveVideoCallData
} = videoCallSlice.actions;
