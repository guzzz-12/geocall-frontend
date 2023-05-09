import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MediaConnection } from "peerjs";

export interface VideoCall {
  status: null | "calling" | "pending" | "accepted" | "ended" | "rejected" | "unavailable";
  callObj: MediaConnection | null;
};

export interface VideoCallState {
  videoCall: VideoCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  activeCallWith: ActiveCallWith | null;
};

export interface VideoCallData {
  remitent: {
    id: string;
    firstName: string;
    avatar: string;
  };
  recipient: {
    id: string;
    firstName: string;
    avatar: string;
  }
}

export interface ActiveCallWith {
  id: string;
  firstName: string;
  avatar: string;
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
    setVideoCall: (state, action: PayloadAction<VideoCall | null>) => {
      state.videoCall = action.payload;
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action: PayloadAction<MediaStream | null>) => {
      state.remoteStream = action.payload;
    },
    setActiveVideoCallData: (state, action: PayloadAction<ActiveCallWith | null>) => {
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
