import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import useGetUserLocation from "../hooks/useGetUserLocation";
import usePeerConnection from "../hooks/usePeerConnection";
import useMediaDevices from "../hooks/useMediaDevices";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { useGetCurrentUserQuery } from "../redux/api";
import { OnlineUser, setOnlineUsers, setSelectedUserPrefetch } from "../redux/features/mapSlice";
import { MapRootState } from "../redux/store";
import { setCurrentUser, setHasMediaDevice, setPeerId } from "../redux/features/userSlice";
import { Message, incomingMessage } from "../redux/features/chatsSlice";
import { Notification, setNotifications } from "../redux/features/notificationsSlice";
import { VideoCallData, setActiveVideoCallData } from "../redux/features/videoCallSlice";

/**
 * Reconectar el usuario al servidor de socket io,
 * escuchar los eventos de socket io,
 * volver a consultar la data y la ubicación del usuario,
 * verificar si el dispositivo tiene cámara,
 * almacenar el id del peer en el state global.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {myLocation} = useSelector((state: MapRootState) => state.map);

  const {data: userData} = useGetCurrentUserQuery();

  // Obtener la ubicación del usuario
  useGetUserLocation();

  // Solicitar permisos de acceso a la cámara
  useMediaDevices();

  // Reinicializar la conexión con el servidor de Peer
  const {peerId} = usePeerConnection();

  useEffect(() => {
    if ("navigator" in window && userData && myLocation && peerId) {
      const currentToken = localStorage.getItem("token");
      dispatch(setCurrentUser({...userData, token: currentToken!}));
      dispatch(setPeerId(peerId));

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then(() => {
        dispatch(setHasMediaDevice(true));
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(setHasMediaDevice(false));
      });

      // Agregar/actualizar el usuario en la lista de
      // los usuarios online del servidor de socket
      // al autenticarse o actualizar la página
      socketClient.userReconnected(userData._id, myLocation, peerId); 

      // Escuchar evento de usuarios online
      // para actualizar el state en tiempo real
      socketClient.socket.on(SocketEvents.GET_ONLINE_USERS, (users: OnlineUser[]) => {
        dispatch(setOnlineUsers(users));
      });

      // Escuchar el evento de nuevo mensaje entrante
      // y actualizar el state de los mensajes del chat correspondiente
      socketClient.socket.on(SocketEvents.NEW_MESSAGE, (newMessage: Message) => {
        const {senderData: {avatar, firstName}} = newMessage;

        dispatch(setSelectedUserPrefetch({
          selectedUserId: newMessage.senderId,
          selectedUserSocketId: newMessage.senderSocketId
        }));
        
        dispatch(incomingMessage({message: newMessage}));

        toast.dismiss();

        toast(
          <div className="flex justify-start items-center gap-4">
            <img
              className="block w-12 h-12 rounded-full"
              src={avatar}
              alt={firstName}
            />
            <p className="text-white text-left opacity-75">
              New message from {firstName}
            </p>
          </div>
        );
      });

      // Escuchar el evento de nueva notificación
      // y actualizar el state sólo si el remitente
      // no es el mismo usuario atenticado
      socketClient.socket.on(SocketEvents.NEW_NOTIFICATION, (notification: Notification) => {
        if (
          notification.notificationType === "incomingMessage" &&
          notification.senderId !== userData._id
        ) {
          dispatch(setNotifications(notification))
        }
      });

      // Escuchar el evento de nueva llamada entrante y actualizar el state global
      // con la data del usuario que está llamando
      socketClient.socket.on(SocketEvents.INCOMING_CALL, (data: VideoCallData) => {
        const {remitent} = data;
        dispatch(setActiveVideoCallData(remitent))
      });
    };
  }, [userData, myLocation, peerId]);

  return null;
};

export default ReconnectUser;