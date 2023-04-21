import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { initStoredChats } from "../redux/features/chatsSlice";
import db from "../db/GeoCallDB";

/**
 * Custom hook para inicializar el state global
 * de los chats del usuario con los chats
 * almacenados en la base de datos local.
 */
const useLocalDbInit = () => {
  const dispatch = useDispatch();

  const chats = useLiveQuery(() => db.chats.toArray());
  
  useEffect(() => {
    if (chats) {
      dispatch(initStoredChats(chats))
    }
  }, [chats]);

  return null;
};

export default useLocalDbInit;