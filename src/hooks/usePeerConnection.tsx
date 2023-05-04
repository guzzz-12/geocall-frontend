import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setVideoCall, setRemoteStream, VideoCall, setActiveVideoCallData } from "../redux/features/videoCallSlice";
import { MapRootState, UserRootState } from "../redux/store";
import peerClient from "../utils/peerClient";
import { SocketEvents, socketClient } from "../socket/socketClient";
import { setPeerId, setUserVideoCallStatus } from "../redux/features/userSlice";
import { getLocalStream } from "../utils/getLocalStream";

/**
 * Inicializar conexión con el servidor de WebRTC vía Peer
 * y escuchar el evento de videollamada entrante.
 */
const usePeerConnection = () => {
  const dispatch = useDispatch();
  const {currentUser, hasMediaDevice, videoCallStatus} = useSelector((state: UserRootState) => state.user);
  const {selectedUser} = useSelector((state: MapRootState) => state.map);


  useEffect(() => {
    // Restablecer la conexión con el servidor de Peer
    // en caso de renicio del servidor
    socketClient.socket.on(SocketEvents.SERVER_RESTARTED, () => {
      if (peerClient.getInstance.disconnected) {
        peerClient.getInstance.reconnect();
      }
    });

    peerClient.getInstance.on("error", (error) => {
      const {message} = error;

      if (message.toLowerCase().includes("lost connection")) {
        peerClient.getInstance.reconnect();
      };

      // Mostrar notificación y restablecer el state
      // si el error se produjo al intentar iniciar una llamada
      if (message.toLowerCase().includes("could not connect to peer")) {
        dispatch(setVideoCall(null));
        dispatch(setActiveVideoCallData(null));
        dispatch(setUserVideoCallStatus("active"));

        socketClient.socket.emit(SocketEvents.CALL_ENDED, selectedUser?.user._id);
      };

      console.log(`Conection error with the peer server: ${message}}`)
    });

    return () => {
      socketClient.socket.off(SocketEvents.SERVER_RESTARTED);
      socketClient.socket.off(SocketEvents.CALL_ENDED);
    }
  }, [selectedUser]);


  // Escuchar los eventos de las videollamdas entrantes
  useEffect(() => {
    peerClient.getInstance.on("open", (id) => {
      dispatch(setPeerId(id));
    });

    // Escuchar el evento de llamada entrante
    peerClient.getInstance.on("call", async (call) => {
      try {
        // Intentar tomar el stream local y continuar si lo tiene
        await getLocalStream();  

        // Si ya tiene una llamada activa retornar
        // sin hacer nada al recibir una videollamada
        if (videoCallStatus === "busy") {
          return false
        };
  
        const videoCall: VideoCall = {
          status: "pending",
          callObj: call
        };
  
        // Abrir el modal de videollamada con el status en pending
        dispatch(setVideoCall(videoCall));
  
        // Al responder la llamada mostrar el stream del usuario que llama
        call.on("stream", (remoteStream) => {
          dispatch(setRemoteStream(remoteStream));
        });
  
        // Notificar al usuario cuando el otro usuario corta la videollamada
        call.on("close", () => {
          console.log("Call ended by the other user")
        });
      } catch (error: any) {
        console.log(error.message);
      };
    });
  }, [currentUser, hasMediaDevice, videoCallStatus]);

  return null;
};

export default usePeerConnection;