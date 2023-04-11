import { useEffect } from "react";
import { useDispatch } from "react-redux";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { useGetUserQuery } from "../redux/api";
import { OnlineUser, setOnlineUsers } from "../redux/features/mapSlice";

/**
 * Reconectar el usuario al servidor de websocket,
 * escuchar los eventos de websocket
 * y volver a consultar la data y la ubicación
 * del usuario al actualizar la app.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {data: userData} = useGetUserQuery();

  // Obtener la ubicación del usuario
  useGetUserLocation();

  useEffect(() => {
    if (userData) {
      // Reconectar el usuario al servidor de socket
      socketClient.userReconnected(userData._id); 

      // Escuchar evento de usuarios online
      // para actualizar el state en tiempo real
      socketClient.socket.on(SocketEvents.GET_ONLINE_USERS, (users: OnlineUser[]) => {
        dispatch(setOnlineUsers(users));
      });
    };
  }, [userData]);

  return null;
};

export default ReconnectUser;