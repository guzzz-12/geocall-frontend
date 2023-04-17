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
    const peerInstance = peerClient.getInstance;

    peerInstance.on("open", (id) => {
      setPeerId(id)
    });

    // Escuchar el evento de llamada entrante
    peerInstance.on("call", (call) => {
      if (!localStream) {
        return false;
      };

      // Abrir el modal de videollamada
      dispatch(setVideoCall(true));
      
      // Responder la llamada transmitiendo el localstream
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