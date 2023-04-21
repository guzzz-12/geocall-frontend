import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import useGetUserLocation from "../hooks/useGetUserLocation";
import usePeerConnection from "../hooks/usePeerConnection";
import useMediaDevices from "../hooks/useMediaDevices";
import useLocalDbInit from "../hooks/useLocalDbInit";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { useGetCurrentUserQuery } from "../redux/api";
import { OnlineUser, setOnlineUsers } from "../redux/features/mapSlice";
import { MapRootState, UserRootState, VideoCallRootState } from "../redux/store";
import { setCurrentUser, setHasMediaDevice, setPeerId, setUserStatus } from "../redux/features/userSlice";
import { Message, incomingMessage } from "../redux/features/chatsSlice";
import { Notification, setNotifications } from "../redux/features/notificationsSlice";
import { VideoCallData, setActiveVideoCallData, setVideoCall } from "../redux/features/videoCallSlice";

/**
 * Reconectar el usuario al servidor de socket io,
 * escuchar los eventos de socket io,
 * volver a consultar la data y la ubicación del usuario,
 * verificar si el dispositivo tiene cámara,
 * almacenar el id del peer en el state global.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {status} = useSelector((state: UserRootState) => state.user);
  const {myLocation} = useSelector((state: MapRootState) => state.map);
  const {videoCall} = useSelector((state: VideoCallRootState) => state.videoCall);

  const {data: userData} = useGetCurrentUserQuery();

  // Obtener la ubicación del usuario
  useGetUserLocation();

  // Solicitar permisos de acceso a la cámara
  useMediaDevices();

  // Reinicializar la conexión con el servidor de Peer
  const {peerId} = usePeerConnection();

  // Consultar los chats almacenados en la DB local
  // y restablecer el state global de los chats
  useLocalDbInit();


  /*--------------------------------------------------------*/
  // Escuchar los eventos relacionados con las videollamadas
  /*--------------------------------------------------------*/
  useEffect(() => {
    // Escuchar el evento de nueva llamada entrante
    socketClient.socket.on(SocketEvents.INCOMING_CALL, (data: VideoCallData) => {
      if (status === "active") {
        console.log("INCOMING_CALL", "status = active")
        const {remitent} = data;
        dispatch(setActiveVideoCallData(remitent));
        dispatch(setUserStatus("busy"));
      };

      if (status === "busy") {
        console.log("INCOMING_CALL", "status = busy");
        socketClient.socket.emit(SocketEvents.CALL_USER_UNAVAILABLE, data.remitent.socketId);
        return false;
      };
    });

    // Restablecer el listener del evento de llamada entrante
    //al cambiar el status del usuario
    return () => {
      socketClient.socket.removeListener(SocketEvents.INCOMING_CALL)
    };
  }, [status]);

  useEffect(() => {
    // Escuchar evento de videollamada aceptada para cambiar el status a accepted
    socketClient.socket.on(SocketEvents.CALL_ACCEPTED, () => {
      console.log("CALL_ACCEPTED");
      dispatch(setVideoCall({...videoCall!, status: "accepted"}));
    });

    // Escuchar evento de videollamada finalizada para cambiar el status a ended
    socketClient.socket.on(SocketEvents.CALL_ENDED, () => {
      console.log("CALL_ENDED");
      dispatch(setVideoCall({...videoCall!, status: "ended"}));
    });
    
    // Escuchar evento de videollamada rechazada para cambiar el status a rejected
    socketClient.socket.on(SocketEvents.CALL_REJECTED, () => {
      console.log("CALL_REJECTED");
      dispatch(setVideoCall({...videoCall!, status: "rejected"}));
    });

    socketClient.socket.on(SocketEvents.CALL_USER_UNAVAILABLE, () => {
      console.log("CALL_USER_UNAVAILABLE");
      dispatch(setVideoCall({...videoCall!, status: "unavailable"}));
    });
  }, [videoCall]);


  /*--------------------------------------------*/
  // Escuchar el resto de los eventos de la app
  /*--------------------------------------------*/
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
    };
  }, [userData, myLocation, peerId]);

  return null;
};

export default ReconnectUser;