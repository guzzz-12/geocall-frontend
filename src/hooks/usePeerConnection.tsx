import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setVideoCall, setRemoteStream, VideoCall, setActiveVideoCallData } from "../redux/features/videoCallSlice";
import { MapRootState, UserRootState, VideoCallRootState } from "../redux/store";
import peerClient from "../utils/peerClient";
import { SocketEvents, socketClient } from "../socket/socketClient";
import { setUserVideoCallStatus } from "../redux/features/userSlice";

/**
 * Inicializar conexión con el servidor de WebRTC vía Peer
 * y escuchar el evento de videollamada entrante.
 */
const usePeerConnection = () => {
  const dispatch = useDispatch();
  const {currentUser, videoCallStatus} = useSelector((state: UserRootState) => state.user);
  const {localStream} = useSelector((state: VideoCallRootState) => state.videoCall);
  const {selectedUser} = useSelector((state: MapRootState) => state.map);
  
  const [peerId, setPeerId] = useState<string | null>(null);


  useEffect(() => {
    // Restablecer la conexión con el servidor de Peer
    // en caso de renicio del servidor
    socketClient.socket.on(SocketEvents.SERVER_RESTARTED, () => {
      peerClient.getInstance.reconnect();
    });

    peerClient.getInstance.on("error", (error) => {
      const {message} = error;

      // Mostrar notificación y restablecer el state
      // si el error se produjo al intentar iniciar una llamada
      if (message.toLowerCase().includes("could not connect to peer")) {
        toast.dismiss()
        toast.error(
          "Error establishing connection with the user. Refresh the page and try again...",
          {
            position: "bottom-right"
          }
        );

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
      setPeerId(id)
    });

    // Escuchar el evento de llamada entrante
    peerClient.getInstance.on("call", (call) => {
      // Si no tiene cámara conectada o si ya tiene una llamada activa
      // retornar sin hacer nada al recibir una videollamada
      if (!localStream || videoCallStatus === "busy") {
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
    });
  }, [currentUser, localStream, videoCallStatus]);

  return {peerId};
};

export default usePeerConnection;