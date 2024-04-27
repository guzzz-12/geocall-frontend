import { configureStore } from "@reduxjs/toolkit";
import { mapReducer } from "./features/mapSlice";
import { userReducer } from "./features/userSlice";
import { chatsReducer } from "./features/chatsSlice";
import { notificationsReducer } from "./features/notificationsSlice";
import { videoCallReducer } from "./features/videoCallSlice";
import { imageModalReducer } from "./features/imageModalSlice";
import { globalAlertReducer } from "./features/globalAlertSlice";
import { api } from "./api";
import { accountApi } from "./accountApi";

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

export type RootState = ReturnType<typeof store.getState>;

// Necesario tipar el hook useDispatch con este type
// para usar actions asíncronas creadas con createAsyncThunk
export type AppDispatch = typeof store.dispatch;

export default store;