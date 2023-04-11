import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { useGetUserQuery } from "../redux/api";
import { OnlineUser, setOnlineUsers } from "../redux/features/mapSlice";
import { MapRootState } from "../redux/store";

/**
 * Reconectar el usuario al servidor de websocket,
 * escuchar los eventos de websocket
 * y volver a consultar la data y la ubicación
 * del usuario al actualizar la app.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {myLocation} = useSelector((state: MapRootState) => state.map);

  const {data: userData} = useGetUserQuery();

  // Obtener la ubicación del usuario
  useGetUserLocation();

  useEffect(() => {
    if (userData && myLocation) {
      // Agregar/actualizar el usuario en la lista de
      // los usuarios online del servidor de socket
      // al autenticarse o actualizar la página
      socketClient.userReconnected(userData._id, myLocation); 

      // Escuchar evento de usuarios online
      // para actualizar el state en tiempo real
      socketClient.socket.on(SocketEvents.GET_ONLINE_USERS, (users: OnlineUser[]) => {
        console.log({onlineUsers: users});
        dispatch(setOnlineUsers(users));
      });
    };
  }, [userData, myLocation]);

  return null;
};

export default ReconnectUser;