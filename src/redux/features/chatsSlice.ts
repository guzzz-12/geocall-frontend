import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import db from "../../db/GeoCallDB";

export interface ChatMember {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  senderData: ChatMember;
  recipientData: ChatMember,
  content: string;
  attachment: string | null,
  unread: boolean;
  deleted: boolean;
  createdAt: string;
};

export interface Chat {
  chatId: string;
  localUser: string;
  senderId: string;
  recipientId: string;
  senderData: ChatMember,
  recipientData: ChatMember,
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
  const index = state.chats.findIndex((chat) => {
    return (
      (chat.senderId === senderId && chat.recipientId === recipientId)
      ||
      (chat.senderId === recipientId && chat.recipientId === senderId)
    )
  });

  const chat = state.chats[index];

  if (!chat) {
    return false
  };

  return {chatIndex: index, chat};
};


const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    initStoredChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    createOrSelectChat: (state, action: PayloadAction<{chat: Chat, otherMember: ChatMember}>) => {
      const {chat: {chatId, senderId, recipientId}, otherMember} = action.payload;

      // Verificar si existe un chat entre ambos usuarios
      const chatExists = checkIfChatExists(state, senderId, recipientId);
      const updatedChats = [...state.chats];
      
      // Si ya existe un chat con el usuario seleccionado
      // seleccionarlo y actualizar su data con la data del backend
      // en caso de que el usuario haya actualizado su perfil
      // Si el chat no existe, crearlo y seleccionarlo.
      if (chatExists) {
        const {chat, chatIndex} = chatExists;

        let updatedChat: Chat = {
          chatId,
          localUser: chat.localUser,
          messages: chat.messages,
          senderId: chat.senderId,
          recipientId: chat.recipientId,
          senderData: chat.senderData,
          recipientData: chat.recipientData,
          createdAt: chat.createdAt
        };

        if (chat.senderId === otherMember._id) {
          updatedChat.senderData = otherMember;
        };
        
        if (chat.recipientId === otherMember._id) {
          updatedChat.recipientData = otherMember;
        };

        updatedChats.splice(chatIndex, 1, updatedChat);

        state.selectedChat = updatedChat;
        state.chats = updatedChats;

        // Actualizar el chat en la base de datos local
        db.chats.update(chatId, updatedChat);

      } else {
        state.chats = [action.payload.chat, ...state.chats];
        state.selectedChat = action.payload.chat;

        // Agregar el chat a la base de datos local
        db.chats.add(action.payload.chat);
      };
    },
    closeChat: (state) => {
      state.selectedChat = null;
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat.chatId !== action.payload);
      db.chats.where("chatId").equals(action.payload).delete();
    },
    createMessage: (state, action: PayloadAction<{chatId: string, message: Message}>) => {
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
    incomingMessage: (state, action: PayloadAction<{message: Message, localUser: string}>) => {
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
          localUser: action.payload.localUser,
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
    deleteMessage: (state, action: PayloadAction<{chatId: string, messageId: string}>) => {
      const {chatId, messageId} = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.chatId === chatId);
      const chat = state.chats[chatIndex];

      if (!chat) {
        return state;
      };

      // Regenerar la lista de mensajes del chat
      const updatedMessages: Message[] = chat.messages.map((msg) => {
        // Eliminar el contenido del mensaje eliminado y pasar su status a deleted
        const content = msg.messageId === messageId ? "Message deleted..." : msg.content;
        const attachment = msg.messageId === messageId ? null : msg.attachment;
        const deleted = msg.messageId === messageId ? true : msg.deleted;

        return {
          chatId: msg.chatId,
          attachment,
          content,
          createdAt: msg.createdAt,
          messageId: msg.messageId,
          recipientData: msg.recipientData,
          recipientId: msg.recipientId,
          senderData: msg.senderData,
          senderId: msg.senderId,
          unread: msg.unread,
          deleted
        }
      });

      chat.messages = updatedMessages;

      // Regenerar la lista de chats
      const updatedChats: Chat[] = state.chats.map(chat => {
        return {
          chatId: chat.chatId,
          senderId: chat.senderId,
          recipientId: chat.recipientId,
          senderData: chat.senderData,
          recipientData: chat.recipientData,
          createdAt: chat.createdAt,
          localUser: chat.localUser,
          messages: chat.messages
        }
      });

      // Reemplazar el chat del mensaje eliminado
      updatedChats.splice(chatIndex, 1, chat);

      // Actualizar el state de la lista de chats
      state.chats = updatedChats;

      // Actualizar el state del chat seleccionado si el chat seleccionado
      // es el mismo que el chat al que pertenece el mensaje eliminado
      if (state.selectedChat?.chatId === chat.chatId) {
        state.selectedChat = chat;
      };

      // Actualizar los mensajes del chat en la DB local
      db.chats
      .where("chatId")
      .equals(action.payload.chatId)
      .modify((item: Chat) => item.messages = updatedMessages)
      .catch((err) => console.log({error_deleting_message: err.message}))
    },
    setReadMessages: (state, action: PayloadAction<{chatId: string}>) => {
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
    },
    clearSelectedChatState: (state) => {
      state.selectedChat = null;
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
  setReadMessages,
  clearSelectedChatState
} = chatsSlice.actions;