import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLocalStream } from "../redux/features/videoCallSlice";

/**
 * Custom hook para solicitar los permisos de acceso a la cámara
 * al intentar realizar una videollamada
 */
const useMediaDevices = () => {
  const dispatch = useDispatch();

  const [myStream, _setMyStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    .then((stream) => {
      setStreamError(null);
      dispatch(setLocalStream(stream));
    })
    .catch((err: any) => {
      setStreamError(err.message);
    });
  }, []);

  return {myStream, streamError};
};

export default useMediaDevices;