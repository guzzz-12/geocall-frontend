import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVideoCall, setRemoteStream, VideoCall } from "../redux/features/videoCallSlice";
import { UserRootState, VideoCallRootState } from "../redux/store";
import peerClient from "../utils/peerClient";

/**
 * Inicializar conexión con el servidor de WebRTC vía Peer
 * y escuchar el evento de videollamada entrante.
 */
const usePeerConnection = () => {
  const dispatch = useDispatch();
  const {videoCallStatus} = useSelector((state: UserRootState) => state.user);
  const {localStream} = useSelector((state: VideoCallRootState) => state.videoCall);
  
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    peerClient.getInstance.on("open", (id) => {
      setPeerId(id)
    });

    // Escuchar el evento de llamada entrante
    peerClient.getInstance.on("call", (call) => {
      if (!localStream) {
        console.log("You must connect your camera to receive videocalls");
        return false;
      };

      if (videoCallStatus === "busy") {
        return false;
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
  }, [localStream, videoCallStatus]);

  return {peerId};
};

export default usePeerConnection;