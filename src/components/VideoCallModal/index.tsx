import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { BsCameraVideoOff } from "react-icons/bs";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { HiPhoneMissedCall, HiOutlinePhoneMissedCall } from "react-icons/hi";
import { FiPhoneCall } from "react-icons/fi";
import IconButton from "../IconButton";
import { VideoCallRootState } from "../../redux/store";
import { setActiveVideoCallData, setVideoCall } from "../../redux/features/videoCallSlice";
import { setUserVideoCallStatus } from "../../redux/features/userSlice";
import { SocketEvents, socketClient } from "../../socket/socketClient";

const VideoCallModal = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const myPeerVideoRef = useRef<HTMLVideoElement | null>(null);

  const dispatch = useDispatch();
  const {videoCall, activeCallWith} = useSelector((state: VideoCallRootState) => state.videoCall);
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
    audioTrack.enabled = !audioTrack.enabled;

    setIsLocalStreamMuted(audioTrack.enabled);
  };


  // Aceptar la videollamada
  const acceptVideoCallHandler = () => {
    if (!localStream) {
      return false;
    };

    socketClient.socket.emit(SocketEvents.CALL_ACCEPTED, activeCallWith!.id);    
    dispatch(setVideoCall({...videoCall, status: "accepted"}));
    videoCall.callObj!.answer(localStream);
  };


  // Finalizar/rechazar la video llamada
  const endVideoCallHandler = (mode: "end" | "reject") => {
    if (mode === "reject") {
      socketClient.socket.emit(SocketEvents.CALL_REJECTED, activeCallWith!.id)
    } else {
      socketClient.socket.emit(SocketEvents.CALL_ENDED, activeCallWith!.id)
    };
    
    videoCall.callObj!.close();
    dispatch(setVideoCall(null));
    dispatch(setActiveVideoCallData(null));
    dispatch(setUserVideoCallStatus("active"));
  };


  return (
    <div
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[10000]">
      <div
        className="relative flex justify-center items-center h-[95dvh] max-w-[98%] aspect-[4/3] p-6 rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {(videoCall.status === "calling"  || videoCall.status === "pending") && (
          <div className="flex flex-col justify-center items-center gap-16">
            <p className="font-bold text-3xl text-center text-gray-600">
              {videoCall.status === "calling" && "Calling "}
              {activeCallWith?.firstName} (@{activeCallWith?.username})
              {videoCall.status === "pending" && " is calling..."}
            </p>

            <div className="flex justify-center items-center gap-16 w-full">
              <Tooltip id="accept-button-tooltip" />
              <Tooltip id="reject-button-tooltip" />

              <div className="relative w-min">
                <button
                  style={{cursor: videoCall.status === "pending" ? "pointer" : "default"}}
                  className="relative flex justify-center items-center p-6 bg-green-100 rounded-full border-4 border-green-800 z-30"
                  data-tooltip-id="accept-button-tooltip"
                  data-tooltip-content="Accept Videocall"
                  disabled={videoCall.status === "calling"}
                  onClick={() => {
                    if (videoCall.status === "calling") {
                      return false;
                    };

                    acceptVideoCallHandler();
                  }}
                >
                  <FiPhoneCall className="w-[60px] h-[60px] stroke-green-800" />
                </button>
                <div className="absolute top-0 left-0 h-full w-full animate-ping rounded-full bg-green-400 opacity-75 z-20" />
              </div>
              
              <button
                className="flex justify-center items-center p-6 bg-red-100 rounded-full border-4 border-red-800 cursor-pointer"
                data-tooltip-id="reject-button-tooltip"
                data-tooltip-content="Reject Videocall"
                onClick={() => {
                  const mode = videoCall.status === "calling" ? "end" : "reject";
                  endVideoCallHandler(mode);
                }}
              >
                <HiOutlinePhoneMissedCall className="w-[60px] h-[60px] stroke-red-800" />
              </button>
            </div>
          </div>
        )}

        {videoCall.status === "unavailable" && (
          <div className="flex flex-col justify-center items-center gap-6">
            <p className="font-bold text-3xl text-center text-gray-600">
              {activeCallWith?.firstName} is not available in this moment.
            </p>
            <button
              className="block min-w-[150px] px-3 py-2 uppercase rounded-sm bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={() => {
                dispatch(setVideoCall(null));
                dispatch(setActiveVideoCallData(null));
                dispatch(setUserVideoCallStatus("active"));
              }}
            >
              Accept
            </button>
          </div>
        )}

        {(videoCall.status === "ended" || videoCall.status === "rejected") && (
          <div className="flex flex-col justify-center items-center gap-6">
            <p className="font-bold text-3xl text-center text-gray-600">
              {activeCallWith?.firstName} {videoCall.status === "ended" ? "ended" : "rejected"} the videocall
            </p>
            <button
              className="block min-w-[150px] px-3 py-2 uppercase rounded-sm bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={() => {
                dispatch(setVideoCall(null));
                dispatch(setActiveVideoCallData(null));
                dispatch(setUserVideoCallStatus("active"));
              }}
            >
              Accept
            </button>
          </div>
        )}

        {/* Mostrar los streams si la video llamada es aceptada */}
        {videoCall.status === "accepted" && (
          <div className="flex flex-col justify-start items-center gap-6 h-full">
            {localStream && (
              <div className="flex flex-col justify-start items-center gap-3 mb-1">
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
                    tooltipText={`End videocall with ${activeCallWith?.firstName}`}
                    onClickHandler={endVideoCallHandler.bind(null, "end")}
                  />
                </div>
              </div>
            )}

            <div className="relative w-full h-full">
              {/* Stream local */}
              <div className="absolute top-2 left-2 w-[250px] px-1 z-10">
                {localStream && (
                  <video
                    ref={myVideoRef}
                    className="w-full"
                    playsInline
                    autoPlay
                    controls
                  />
                )}
                {!localStream && (
                  <div className="flex flex-col justify-center items-center gap-3 w-full h-full bg-[rgba(0,0,0,0.65)]">
                    <p className="text-sm text-white text-center">
                      Your video device is disconnected!
                    </p>
                    <BsCameraVideoOff className="w-[120px] h-[120px] opacity-60" color="white" />
                  </div>
                )}
              </div>

              {/* Stream remoto */}
              <div className="w-full h-full p-1 rounded shadow border border-gray-100">
                {remoteStream && (
                  <video
                    ref={myPeerVideoRef}
                    className="h-full mx-auto"
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
        )}
      </div>
    </div>
  )
};

export default VideoCallModal;