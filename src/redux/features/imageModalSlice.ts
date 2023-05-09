import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ImageModalState {
  isOpen: boolean;
  image: string | null;
};

const initialState: ImageModalState = {
  isOpen: false,
  image: null
};

const imageModalSlice = createSlice({
  name: "imageModal",
  initialState,
  reducers: {
    openImageModal: (state, action: PayloadAction<string>) => {
      state.isOpen = true;
      state.image = action.payload;
    },
    closeImageModal: (state) => {
      state.isOpen = false;
      state.image = null
    }
  }
});

export const imageModalReducer = imageModalSlice.reducer;
export const {closeImageModal, openImageModal} = imageModalSlice.actions;