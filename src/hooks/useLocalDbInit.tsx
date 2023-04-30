import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLiveQuery } from "dexie-react-hooks";
import { initStoredChats } from "../redux/features/chatsSlice";
import db from "../db/GeoCallDB";
import { UserRootState } from "../redux/store";

/**
 * Custom hook para inicializar el state global
 * de los chats del usuario con los chats
 * almacenados en la base de datos local.
 */
const useLocalDbInit = () => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  const chats = useLiveQuery(() => {
    if (currentUser) {
      return (
        db.chats
        .where("localUser")
        .equals(currentUser._id)
        .toArray()
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