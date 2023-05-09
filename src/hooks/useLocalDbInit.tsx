import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { initStoredChats } from "../redux/features/chatsSlice";
import db from "../db/GeoCallDB";
import { RootState } from "../redux/store";

/**
 * Custom hook para inicializar el state global
 * de los chats del usuario con los chats
 * almacenados en la base de datos local.
 */
const useLocalDbInit = () => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: RootState) => state.user);

  const chats = useLiveQuery(() => {
    if (currentUser) {
      return (
        db.chats
        .where("localUser")
        .equals(currentUser._id)
        .toArray()
        .catch((error: any) => {
          throw new Error(`Error initializing database: ${error.message}`)
        })
      )
    };

    return []
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser && chats) {
      dispatch(initStoredChats(chats));
    }
  }, [currentUser, chats]);

  return null;
};

export default useLocalDbInit;