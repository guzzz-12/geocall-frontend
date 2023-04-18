import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVideoCall, setRemoteStream } from "../redux/features/videoCallSlice";
import { VideoCallRootState } from "../redux/store";
import peerClient from "../utils/peerClient";

/**
 * Inicializar conexión con el servidor de WebRTC vía Peer
 * y escuchar el evento de videollamada entrante.
 */
const usePeerConnection = () => {
  const dispatch = useDispatch();
  const {localStream} = useSelector((state: VideoCallRootState) => state.videoCall);
  
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    peerClient.getInstance.on("open", (id) => {
      setPeerId(id)
    });

    // Escuchar el evento de llamada entrante
    peerClient.getInstance.on("call", (call) => {
      if (!localStream) {
        console.log({incomingCall: call});
        console.log("You must connect your camera to receive videocalls");
        return false;
      };

      // Abrir el modal de videollamada
      dispatch(setVideoCall(true));
      
      // Responder la llamada transmitiendo el stream local del usuario
      // al usuario remoto que realizó la llamada
      call.answer(localStream);

      // Al responder la llamada mostrar el stream del usuario que llama
      call.on("stream", (remoteStream) => {
        dispatch(setRemoteStream(remoteStream));
      })
    });
  }, [localStream]);

  return {peerId};
};

export default usePeerConnection;