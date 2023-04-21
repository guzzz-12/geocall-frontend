import Dexie from "dexie";
import { Chat } from "../redux/features/chatsSlice";

class GeoCallDB extends Dexie {
  chats!: Dexie.Table<Chat>

  constructor() {
    super("GeoCallDB");

    this.version(1).stores({
      chats: "chatId, senderId, recipientId, messages, createdAt"
    });
  };
};

const db = new GeoCallDB();

export default db;