import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import useGetUserLocation from "../hooks/useGetUserLocation";
import usePeerConnection from "../hooks/usePeerConnection";
import useLocalDbInit from "../hooks/useLocalDbInit";
import { socketClient, SocketEvents } from "../socket/socketClient";
import { OnlineUser, setOnlineUsers } from "../redux/features/mapSlice";
import { MapRootState, UserRootState, VideoCallRootState } from "../redux/store";
import { setHasMediaDevice, setUserVideoCallStatus } from "../redux/features/userSlice";
import { Message, deleteMessage, incomingMessage } from "../redux/features/chatsSlice";
import { Notification, setNotifications } from "../redux/features/notificationsSlice";
import { VideoCallData, setActiveVideoCallData, setLocalStream, setRemoteStream, setVideoCall } from "../redux/features/videoCallSlice";
import { getLocalStream } from "../utils/getLocalStream";

/**
 * Reconectar el usuario al servidor de socket io,
 * escuchar los eventos de socket io,
 * volver a consultar la data y la ubicación del usuario,
 * verificar si el dispositivo tiene cámara,
 * almacenar el id del peer en el state global.
 */
const ReconnectUser = () => {  
  const dispatch = useDispatch();
  const {currentUser, videoCallStatus, hasMediaDevice, peerId} = useSelector((state: UserRootState) => state.user);
  const {myLocation} = useSelector((state: MapRootState) => state.map);
  const {videoCall, localStream} = useSelector((state: VideoCallRootState) => state.videoCall);

  const [disconnected, setDisconnected] = useState(false);

  // Obtener la ubicación del usuario
  useGetUserLocation();

  // Reinicializar la conexión con el servidor de Peer
  usePeerConnection();

  // Consultar los chats almacenados en la DB local
  // y restablecer el state global de los chats
  useLocalDbInit();

  /**
   * Apagar la cámara
   */
  const shutDownCameraHandler = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop())
  };


  useEffect(() => {
    // Verificar si el usuario tiene dispositivo de video
    // cuando inicialice o refresque la app
    if ("navigator" in window) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then((stream) => {
        // Especificar que el usuario sí posee cámara
        dispatch(setHasMediaDevice(true));
        // Apagar la cámara de inmediato
        shutDownCameraHandler(stream);
      })
      .catch((err: any) => {
        console.log(err);
        dispatch(setHasMediaDevice(false));
      });
    };

    // Escuchar evento de usuarios online
    // para actualizar el state en tiempo real
    socketClient.socket.on(SocketEvents.GET_ONLINE_USERS, (users: OnlineUser[]) => {
      dispatch(setOnlineUsers(users));
    });

    // Escuchar evento de desconexión con el servidor de socket
    socketClient.socket.on("disconnect", () => {
      console.log("User disconnected");
      toast.info("Connection lost. Refresh the page to go back online.")
    });

    return () => {
      socketClient.socket.off(SocketEvents.GET_ONLINE_USERS);
      socketClient.socket.off("disconnect");
    };
  }, []);


  /*----------------------------------------------*/
  // Escuchar el evento de nueva llamada entrante
  /*----------------------------------------------*/
  useEffect(() => {
    socketClient.socket.on(SocketEvents.INCOMING_CALL, async (data: VideoCallData) => {
      try {
        // Si está disponible, tomar el stream de su cámara y aceptar la llamada
        if (videoCallStatus === "active") {
          const {remitent} = data;
          
          const myStream = await getLocalStream();

          dispatch(setLocalStream(myStream));
          dispatch(setActiveVideoCallData(remitent));
          dispatch(setUserVideoCallStatus("busy"));
        };
  
        // Si no está disponible,  rechazar la llamada y notificarle al usuario remoto
        if (videoCallStatus === "busy" || !hasMediaDevice) {
          socketClient.userCallUnavailable(data.remitent.id);
          return false;
        };
      } catch (error) {
        console.log("Error getting local stream");
        socketClient.userCallUnavailable(data.remitent.id);
      };
    });

    // Restablecer el listener del evento de llamada entrante
    // al cambiar el status del usuario
    return () => {
      socketClient.socket.removeListener(SocketEvents.INCOMING_CALL)
    };
  }, [videoCallStatus, hasMediaDevice]);


  useEffect(() => {
    // Escuchar evento de videollamada aceptada para cambiar el status a accepted
    socketClient.socket.on(SocketEvents.CALL_ACCEPTED, () => {
      console.log("CALL_ACCEPTED");
      dispatch(setVideoCall({...videoCall!, status: "accepted"}));
    });

    // Escuchar evento de videollamada finalizada
    // para cambiar el status a ended y apagar la cámara
    socketClient.socket.on(SocketEvents.CALL_ENDED, () => {
      if (videoCall && localStream) {
        console.log("CALL_ENDED");
        shutDownCameraHandler(localStream);
        dispatch(setVideoCall({...videoCall, status: "ended"}));
        dispatch(setLocalStream(null));
        dispatch(setRemoteStream(null));
      }
    });
    
    // Escuchar evento de videollamada rechazada para cambiar el status a rejected
    socketClient.socket.on(SocketEvents.CALL_REJECTED, () => {
      if (videoCall && localStream) {
        console.log("CALL_REJECTED");
        shutDownCameraHandler(localStream);
        dispatch(setVideoCall({...videoCall, status: "rejected"}));
      }
    });

    // Escuchar evento de usuario no disponible
    socketClient.socket.on(SocketEvents.CALL_USER_UNAVAILABLE, () => {
      console.log("CALL_USER_UNAVAILABLE");
      dispatch(setVideoCall({...videoCall!, status: "unavailable"}));
    });

    // Remover los listener al desmontar el componente
    // para evitar disparar los eventos múltiples veces
    return () => {
      socketClient.socket.off(SocketEvents.CALL_ACCEPTED);
      socketClient.socket.off(SocketEvents.CALL_ENDED);
      socketClient.socket.off(SocketEvents.CALL_REJECTED);
      socketClient.socket.off(SocketEvents.CALL_USER_UNAVAILABLE);
    };
  }, [videoCall, localStream]);


  /*------------------------------------------------*/
  // Eventos de mensajes entrantes y notificaciones
  /*------------------------------------------------*/
  useEffect(() => {
    // Escuchar el evento de nuevo mensaje entrante
    // y actualizar el state de los mensajes del chat correspondiente
    if (currentUser){
      socketClient.socket.on(SocketEvents.NEW_MESSAGE, (newMessage: Message) => {
        const {senderData: {avatar, firstName}} = newMessage;
        
        dispatch(incomingMessage({
          message: newMessage,
          localUser: currentUser._id
        }));
  
        toast.dismiss();
  
        toast(
          <div className="flex justify-start items-center gap-4">
            <img
              className="block w-12 h-12 object-cover object-center rounded-full"
              src={avatar}
              alt={firstName}
            />
            <p className="text-white text-left opacity-75">
              New message from {firstName}
            </p>
          </div>
        );
      });

      // Escuchar evento de mensaje eliminado
      socketClient.socket.on(SocketEvents.DELETED_MESSAGE, (data: {chatId: string, messageId: string}) => {
        console.log("DELETED MESSGE");
        dispatch(deleteMessage(data));
      });

      // Escuchar el evento de nueva notificación
      // y actualizar el state sólo si el remitente
      // no es el mismo usuario atenticado
      socketClient.socket.on(SocketEvents.NEW_NOTIFICATION, (notification: Notification) => {
        if (
          notification.notificationType === "incomingMessage" &&
          notification.senderId !== currentUser._id
        ) {
          dispatch(setNotifications(notification))
        }
      });

      // Remover los listener al desmontar el componente
      // para evitar disparar los eventos múltiples veces
      return () => {
        socketClient.socket.off(SocketEvents.NEW_MESSAGE);
        socketClient.socket.off(SocketEvents.DELETED_MESSAGE);
        socketClient.socket.off(SocketEvents.NEW_NOTIFICATION);
      };
    }
  }, [currentUser]);


  /*---------------------------------------------------------------*/
  // Escuchar eventos relacionados con la conexión de los usuarios
  /*---------------------------------------------------------------*/
  useEffect(() => {
    if (currentUser && myLocation && peerId) {
      // Agregar/actualizar el usuario en la lista de
      // los usuarios online del servidor de socket
      // al autenticarse o actualizar la página
      socketClient.userReconnected(currentUser._id, myLocation, peerId);
  
      // Restablecer el usuario en la lista de usuarios online al reiniciarse el servidor
      socketClient.socket.on(SocketEvents.SERVER_RESTARTED, () => {
        socketClient.userReconnected(currentUser._id, myLocation, peerId); 
      });
    };

    return () => {
      socketClient.socket.off(SocketEvents.SERVER_RESTARTED);
    }
  }, [currentUser, myLocation, peerId]);

  return null;
};

export default ReconnectUser;