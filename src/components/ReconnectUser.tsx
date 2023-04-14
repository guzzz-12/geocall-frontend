import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { useGetCurrentUserQuery } from "../redux/api";
import { OnlineUser, setOnlineUsers } from "../redux/features/mapSlice";
import { MapRootState } from "../redux/store";
import { setCurrentUser } from "../redux/features/userSlice";
import { Message, incomingMessage } from "../redux/features/chatsSlice";

/**
 * Reconectar el usuario al servidor de websocket,
 * escuchar los eventos de socket io
 * y volver a consultar la data y la ubicación
 * del usuario al actualizar la app.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {myLocation} = useSelector((state: MapRootState) => state.map);

  const {data: userData} = useGetCurrentUserQuery();

  // Obtener la ubicación del usuario
  useGetUserLocation();

  useEffect(() => {
    if (userData && myLocation) {
      dispatch(setCurrentUser(userData));

      // Agregar/actualizar el usuario en la lista de
      // los usuarios online del servidor de socket
      // al autenticarse o actualizar la página
      socketClient.userReconnected(userData._id, myLocation); 

      // Escuchar evento de usuarios online
      // para actualizar el state en tiempo real
      socketClient.socket.on(SocketEvents.GET_ONLINE_USERS, (users: OnlineUser[]) => {
        dispatch(setOnlineUsers(users));
      });

      // Escuchar el evento de nuevo mensaje entrante
      // y actualizar el state de los mensajes del chat correspondiente
      socketClient.socket.on(SocketEvents.NEW_MESSAGE, (newMessage: Message) => {
        dispatch(incomingMessage({message: newMessage}));
      });
    };
  }, [userData, myLocation]);

  return null;
};

export default ReconnectUser;