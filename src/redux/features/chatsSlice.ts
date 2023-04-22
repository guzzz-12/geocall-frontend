import { createSlice } from "@reduxjs/toolkit";
import db from "../../db/GeoCallDB";

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  senderData: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  recipientData: {
    firstName: string;
    lastName: string;
    avatar: string;
  },
  content: string;
  unread: boolean;
  createdAt: string;
};

export interface Chat {
  chatId: string;
  senderId: string;
  recipientId: string;
  senderData: {
    firstName: string;
    lastName: string;
    avatar: string;
  },
  recipientData: {
    firstName: string;
    lastName: string;
    avatar: string;
  },
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


/**
 * Verificar si existe un chat entre los usuarios especificados
 */
const checkIfChatExists = (state: ChatsState, senderId: string, recipientId: string) => {
  return state.chats.find((chat) => {
    return (
      (chat.senderId === senderId && chat.recipientId === recipientId)
      ||
      (chat.senderId === recipientId && chat.recipientId === senderId)
    )
  });
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

      // Verificar si existe un chat entre ambos usuarios
      const chatExists = checkIfChatExists(state, senderId, recipientId);

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
      // Buscar el chat en el state global
      const chatIndex = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);
      const chat = state.chats[chatIndex];

      // Si no existe, retornar sin hacer nada
      if (!chat) {
        return state;
      };

      // Agregar el mensaje a los mensajes del chat
      const updatedMessages = [...chat.messages, action.payload.message];
      chat.messages = updatedMessages;
      
      // Actualizar el chat en la lista de chats
      const updatedChats = [...state.chats];
      updatedChats.splice(chatIndex, 1, chat);
      
      state.chats = updatedChats;
      state.selectedChat = chat;

      // Actualizar los mensajes del chat en la DB local
      db.chats
      .where("chatId")
      .equals(chat.chatId)
      .modify((item: Chat) => item.messages.push(action.payload.message))
      .catch((err) => console.log({error_updating_chat: err.message}))
    },
    incomingMessage: (state, action: {type: string, payload: {message: Message}}) => {
      const {
        message: {
          chatId,
          senderId,
          recipientId,
          senderData,
          recipientData,
          createdAt
        }
      } = action.payload;

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
        db.chats
        .where("chatId")
        .equals(chatExists.chatId)
        .modify((item: Chat) => item.messages.push(action.payload.message))
        .catch((err) => console.log({error_updating_chat: err.message}))

      } else {
        const chat: Chat = {
          chatId,
          senderId,
          recipientId,
          senderData,
          recipientData,
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
      db.chats
      .where("chatId")
      .equals(action.payload.chatId)
      .modify((item: Chat) => item.messages = updatedMessages)
      .catch((err) => console.log({error_deleting_message: err.message}))
    },
    setReadMessages: (state, action: {type: string, payload: {chatId: string}}) => {
      const chat = state.chats.find(chat => chat.chatId === action.payload.chatId);
      const chatIndex = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);

      if (!chat) {
        return state;
      };

      // Pasar el status de los mensajes del chat a unread = false
      const updatedMessages = [...chat.messages];
      updatedMessages.forEach(msg => msg.unread = false);
      chat.messages = updatedMessages;
      
      // Actualizar el chat con los mensajes actualizados en el state de los chats
      const updatedChats = [...state.chats];
      updatedChats.splice(chatIndex, 1, chat);

      // Actualizar el chat con los mensajes actualizados en la DB local
      db.chats
      .where("chatId")
      .equals(action.payload.chatId)
      .modify((item: Chat) => item.messages = updatedMessages)
      .catch((err) => console.log({error_updating_unread_messages: err.message}))
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
  deleteMessage,
  setReadMessages
} = chatsSlice.actions;