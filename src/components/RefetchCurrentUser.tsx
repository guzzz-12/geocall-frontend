import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "./Spinner";
import { api, useGetCurrentUserQuery } from "../redux/api";
import { removeCurrentUser, setCurrentUser, setIsLoadingUser } from "../redux/features/userSlice";
import { RootState } from "../redux/store";
import { clearMapState } from "../redux/features/mapSlice";
import { clearSelectedChatState } from "../redux/features/chatsSlice";
import { socketClient } from "../socket/socketClient";

const RefetchCurrentUser = () => {
  const dispatch = useDispatch();
  const {isLoading: isLoadingUser, currentUser} = useSelector((state: RootState) => state.user);
  const currentToken = localStorage.getItem("token");

  // No realizar la consulta si no hay token
  const {data, isLoading, isError} = useGetCurrentUserQuery(undefined, {
    skip: !currentToken || currentToken === "null"
  });

  useEffect(() => {
    if (data) {
      dispatch(setCurrentUser({...data, token: currentToken!}));
    };
  }, [data]);


  // Si hay error en la consulta
  // pasar el state loading a false
  // y resetear el state global del usuario
  useEffect(() => {
    if (isError) {
      currentUser && socketClient.userLogout(currentUser!._id);
      dispatch(api.util.resetApiState());
      dispatch(removeCurrentUser());
      dispatch(clearMapState());
      dispatch(clearSelectedChatState());
      dispatch(setIsLoadingUser(false));
    };
    
    if (!currentUser) {
      dispatch(setIsLoadingUser(false));
    };

    // Agregar el header de autorización de Socket.io
    if (currentUser) {
      socketClient.socket.io.opts.extraHeaders = {auth: currentUser.token};
      socketClient.socket.disconnect().connect();
    };

  }, [isError, currentUser]);


  if(isLoading || isLoadingUser) {
    return (
      <Spinner size="large"/>
    )
  };

  return null;
};

export default RefetchCurrentUser;