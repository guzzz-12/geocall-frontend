import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { GrClose } from "react-icons/gr";
import { BsCameraVideoOff } from "react-icons/bs";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { HiPhoneMissedCall } from "react-icons/hi";
import IconButton from "../IconButton";
import { MapRootState, VideoCallRootState } from "../../redux/store";
import { setActiveVideoCallData, setVideoCall } from "../../redux/features/videoCallSlice";

const VideoCallModal = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const myPeerVideoRef = useRef<HTMLVideoElement | null>(null);

  const dispatch = useDispatch();
  const {videoCall, activeCallWith} = useSelector((state: VideoCallRootState) => state.videoCall);
  const {selectedUser} = useSelector((state: MapRootState) => state.map);
  const {localStream, remoteStream} = useSelector((state: VideoCallRootState) => state.videoCall);

  const [isLocalStreamMuted, setIsLocalStreamMuted] = useState(false);
  
  // Inicializar los videos de los participantes de la videollamada
  useEffect(() => {
    const localVideoElement = myVideoRef.current;
    const remoteVideoElement = myPeerVideoRef.current;

    if (localStream && localVideoElement) {
      localVideoElement.srcObject = localStream;
      localVideoElement.onloadedmetadata = () => localVideoElement.play();
    };

    if (remoteStream && remoteVideoElement) {
      remoteVideoElement.srcObject = remoteStream;
      remoteVideoElement.onloadedmetadata = () => remoteVideoElement.play();
    };
  }, [localStream, remoteStream]);


  if (!videoCall) {
    return null;
  };


  // Mutear/desmutear el audio de la transmisión de salida
  const toggleMuteStreamHandler = () => {
    if (!localStream) {
      return false;
    };

    const audioTrack = localStream.getAudioTracks()[0];

    setIsLocalStreamMuted((prev) => {
      audioTrack.enabled = !prev;
      return !prev;
    });
  };


  // Finalizar la video llamada
  const endVideoCallHandler = () => {
    videoCall.close();
    dispatch(setVideoCall(null));
    dispatch(setActiveVideoCallData(null));
  };


  return (
    <div
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[10000]">
      <div
        className="relative flex justify-center items-center w-[90%] aspect-[16/9] p-6 rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip id="close-button-tooltip" />
        <div
          className="absolute top-3 right-3 w-6 h-6 cursor-pointer z-10"
          data-tooltip-id="close-button-tooltip"
          data-tooltip-content={`End videocall with ${selectedUser?.user.firstName}`}
          onClick={endVideoCallHandler}
        >
          <GrClose className="w-full h-full opacity-75" />
        </div>
        <div className="flex flex-col justify-start items-center gap-6 h-full">
          {localStream && (
            <div className="flex flex-col justify-start items-center gap-3 mb-3">
              <p className="font-bold text-2xl text-center text-gray-600">
                Active video call with {activeCallWith?.firstName} (@{activeCallWith?.username})
              </p>
              <div className="flex justify-stretch items-center gap-1 min-w-[200px]">
                <IconButton
                  Icon={!isLocalStreamMuted ? FaMicrophone : FaMicrophoneSlash}
                  disabled={false}
                  tooltipText={isLocalStreamMuted ? "Enable audio" : "Disable audio"}
                  onClickHandler={toggleMuteStreamHandler}
                />
                <IconButton
                  Icon={HiPhoneMissedCall}
                  disabled={false}
                  tooltipText={`End videocall with ${selectedUser?.user.firstName}`}
                  onClickHandler={endVideoCallHandler}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between gap-3 w-full">
            {/* Stream local */}
            <div className="flex justify-center items-center w-[50%] aspect-[4/3] p-1 border border-gray-300 rounded">
              {localStream && (
                <video
                  ref={myVideoRef}
                  className="w-100"
                  playsInline
                  autoPlay
                  controls
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
            <div className="flex justify-center items-center w-[50%] aspect-[4/3] p-1 border border-gray-300 rounded">
              {remoteStream && (
                <video
                  ref={myPeerVideoRef}
                  className="w-100"
                  playsInline
                  autoPlay
                  controls
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
    </div>
  )
};

export default VideoCallModal;