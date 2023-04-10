import { useEffect } from "react";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { socketClient } from "../socket/socketClient";
import { useGetUserQuery } from "../redux/api";

/**
 * Reconectar el usuario al servidor de web socket
 * y volver a consultar la data y ubicación
 * del usuario al actualizar la app.
 */
const ReconnectUser = () => {  
  const {data: userData} = useGetUserQuery();

  useGetUserLocation();

  useEffect(() => {
    if (userData) {
      socketClient.userReconnected(userData._id); 
    };
  }, [userData]);

  return null;
};

export default ReconnectUser;