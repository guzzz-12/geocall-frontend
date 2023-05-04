import { configureStore } from "@reduxjs/toolkit";
import { MapState, mapReducer } from "./features/mapSlice";
import { UserState, userReducer } from "./features/userSlice";
import { ChatsState, chatsReducer } from "./features/chatsSlice";
import { NotificationsState, notificationsReducer } from "./features/notificationsSlice";
import { VideoCallState, videoCallReducer } from "./features/videoCallSlice";
import { ImageModalState, imageModalReducer } from "./features/imageModalSlice";
import { GlobalAlertState, globalAlertReducer } from "./features/globalAlertSlice";
import { api } from "./api";
import { accountApi } from "./accountApi";

export interface MapRootState {
  map: MapState;
};

export interface UserRootState {
  user: UserState;
};

export interface ChatsRootState {
  chats: ChatsState;
};

export interface NotificationsRootState {
  notifications: NotificationsState
};

export interface VideoCallRootState {
  videoCall: VideoCallState
};

export interface ImageModalRootState {
  imageModal: ImageModalState
};

export interface GlobalAlertRootState {
  globalAlert: GlobalAlertState
};

const store = configureStore({
  reducer: {
    map: mapReducer,
    user: userReducer,
    chats: chatsReducer,
    notifications: notificationsReducer,
    videoCall: videoCallReducer,
    imageModal: imageModalReducer,
    globalAlert: globalAlertReducer,
    [api.reducerPath]: api.reducer,
    [accountApi.reducerPath]: accountApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ["videoCall/setVideoCall", "videoCall/setLocalStream", "videoCall/setRemoteStream"],
      ignoredPaths: ["videoCall.videoCall", "videoCall.localStream", "videoCall.remoteStream"]
    }
  }).concat([api.middleware, accountApi.middleware])
});

export default store;