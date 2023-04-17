import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GrClose } from "react-icons/gr";
import { BsCameraVideoOff } from "react-icons/bs";
import { VideoCallRootState } from "../../redux/store";
import { setVideoCall } from "../../redux/features/videoCallSlice";

const VideoCallModal = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const myPeerVideoRef = useRef<HTMLVideoElement | null>(null);

  const dispatch = useDispatch();
  const {videoCall} = useSelector((state: VideoCallRootState) => state.videoCall);
  const {localStream, remoteStream} = useSelector((state: VideoCallRootState) => state.videoCall);
  
  // Inicializar los videos de los participantes de la videollamada
  useEffect(() => {
    if (localStream) {
      const videoElement = myVideoRef.current!;
      videoElement.srcObject = localStream;
      videoElement.onloadedmetadata = () => videoElement.play();
    };

    if (remoteStream) {
      const videoElement = myPeerVideoRef.current!;
      videoElement.srcObject = remoteStream;
      videoElement.onloadedmetadata = () => videoElement.play();
    };
  }, [localStream, remoteStream]);


  if (!videoCall) {
    return null;
  };


  return (
    <div
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[10000]"
      onClick={() => dispatch(setVideoCall(false))}
    >
      <div
        className="relative flex justify-center items-center w-[90%] aspect-[16/9] p-5 rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-3 right-3 w-6 h-6 cursor-pointer z-10"
          onClick={() => dispatch(setVideoCall(false))}
        >
          <GrClose className="w-full h-full opacity-75" />
        </div>
        <div className="flex justify-between gap-3 w-full">
          {/* Stream local */}
          <div className="w-[50%] aspect-[4/3] p-1 border border-gray-300 rounded-xl">
            {localStream && (
              <video
                ref={myVideoRef}
                className="w-100 aspect-video"
                playsInline
                autoPlay
              />
            )}
            {!localStream && (
              <div className="flex flex-col justify-center items-center gap-3 w-full h-full">
                <p className="text-base text-center">
                  Sorry. You don't have any video device connected!
                </p>
                <BsCameraVideoOff className="w-[120px] h-[120px] opacity-60" />
              </div>
            )}
          </div>

          {/* Stream remoto */}
          <div className="w-[50%] p-1 border border-gray-300 rounded-xl">
            {remoteStream && (
              <video
                ref={myPeerVideoRef}
                className="w-100 aspect-video"
                playsInline
                autoPlay
              />
            )}
            {!remoteStream && (
              <div className="flex flex-col justify-center items-center gap-3 w-full h-full">
                <p className="text-base text-center">
                  There was a problem stablishing connection with your partner
                </p>
                <BsCameraVideoOff className="w-[120px] h-[120px] opacity-60" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default VideoCallModal;