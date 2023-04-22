import { createSlice } from "@reduxjs/toolkit";
import db from "../../db/GeoCallDB";

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  senderData: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  recipientId: string;
  content: string;
  senderSocketId: string;
  createdAt: string;
};

export interface Chat {
  chatId: string;
  senderId: string;
  recipientId: string;
  messages: Message[];
  createdAt: string;
};

export interface ChatsState {
  chats: Chat[];
  selectedChat: Chat | null;
};

const initialState: ChatsState = {
  chats: [],
  selectedChat: null
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    initStoredChats: (state, action: {type: string, payload: Chat[]}) => {
      state.chats = action.payload;
    },
    createOrSelectChat: (state, action: {type: string, payload: Chat}) => {
      const {senderId, recipientId} = action.payload;

      const chatExists = state.chats.find((chat) => {
        return (
          (chat.senderId === senderId && chat.recipientId === recipientId)
          ||
          (chat.senderId === recipientId && chat.recipientId === senderId)
        )
      });

      // Si ya existe un chat con el usuario que seleccioné, seleccionarlo
      // Si el chat no existe, crearlo y seleccionarlo
      if (chatExists) {
        state.selectedChat = chatExists;
      } else {
        state.chats = [action.payload, ...state.chats];
        state.selectedChat = action.payload;

        // Agregar el chat a la base de datos local
        db.chats.add(action.payload);
      };
    },
    closeChat: (state) => {
      state.selectedChat = null;
    },
    deleteChat: (state, action: {type: string, payload: string}) => {
      state.chats = state.chats.filter(chat => chat.chatId !== action.payload);
      db.chats.where("chatId").equals(action.payload).delete();
    },
    createMessage: (state, action: {type: string, payload: {chatId: string, message: Message}}) => {
      const chatIndex = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);
      const chat = state.chats[chatIndex];

      if (!chat) {
        return state;
      };

      const updatedMessages = [...chat.messages, action.payload.message];
      chat.messages = updatedMessages;
      
      const updatedChats = [...state.chats];
      updatedChats.splice(chatIndex, 1, chat);
      state.chats = updatedChats;
      state.selectedChat = chat;

      // Actualizar los mensajes del chat en la DB local
      db.chats.where("chatId").equals(action.payload.chatId).modify({...chat})
    },
    incomingMessage: (state, action: {type: string, payload: { message: Message}}) => {
      const {message: {chatId, senderId, recipientId, createdAt}} = action.payload;

      // Verificar si el chat existe
      const chatIndex = state.chats.findIndex((chat) => {
        return (
          (chat.senderId === senderId && chat.recipientId === recipientId)
          ||
          (chat.senderId === recipientId && chat.recipientId === senderId)
        )
      });

      const chatExists = state.chats[chatIndex];

      // Si ya existe un chat con los usuarios del mensaje, actualizarlo
      // Si no existe un chat con los usuarios del mensaje, crearlo
      if (chatExists) {
        const updatedMessages = [...chatExists.messages, action.payload.message];
        chatExists.messages = updatedMessages;

        const updatedChats = [...state.chats];
        updatedChats.splice(chatIndex, 1, chatExists);
        state.chats = updatedChats;

        if (state.selectedChat?.chatId === chatExists.chatId) {
          state.selectedChat = chatExists;
        };

        // Actualizar los mensajes del chat en la DB local
        db.chats.where("chatId").equals(chatId).modify({...chatExists})

      } else {
        const chat: Chat = {
          chatId,
          senderId,
          recipientId,
          messages: [action.payload.message],
          createdAt
        };

        state.chats = [chat, ...state.chats];

        // Agregar el chat a la base de datos local
        db.chats.add(chat);
      };
    },
    deleteMessage: (state, action: {type: string, payload: {chatId: string, messageId: string}}) => {
      const {chatId, messageId} = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.chatId === chatId);
      const chat = state.chats[chatIndex];

      if (!chat) {
        return state;
      };

      const updatedMessages = chat.messages.filter(msg => msg.messageId !== messageId);
      chat.messages = updatedMessages;

      const updatedChats = [...state.chats];
      updatedChats.splice(chatIndex, 1, chat);
      state.chats = updatedChats;

      // Actualizar los mensajes del chat en la DB local
      db.chats.where("chatId").equals(action.payload.chatId).modify({...chat})
    }
  }
});

export const chatsReducer = chatsSlice.reducer;
export const {
  initStoredChats,
  createOrSelectChat,
  createMessage,
  incomingMessage,
  closeChat,
  deleteChat,
  deleteMessage
} = chatsSlice.actions;