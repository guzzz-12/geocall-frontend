import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { toast } from "react-toastify";
import { BsCameraVideoOff, BsFillRecordFill, BsFillStopFill } from "react-icons/bs";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { HiPhoneMissedCall, HiOutlinePhoneMissedCall, HiDownload } from "react-icons/hi";
import { FiPhoneCall } from "react-icons/fi";
import IconButton from "../IconButton";
import { RootState } from "../../redux/store";
import { setActiveVideoCallData, setRemoteStream, setVideoCall } from "../../redux/features/videoCallSlice";
import { setUserVideoCallStatus } from "../../redux/features/userSlice";
import { SocketEvents, socketClient } from "../../socket/socketClient";

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];

const VideoCallModal = () => {
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const myPeerVideoRef = useRef<HTMLVideoElement | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const dispatch = useDispatch();
  const {videoCall, activeCallWith, localStream, remoteStream} = useSelector((state: RootState) => state.videoCall);
  const {onlineUsers} = useSelector((state: RootState) => state.map);

  const [isLocalStreamMuted, setIsLocalStreamMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingReady, setIsRecordingReady] = useState(false);
  
  // State para indicar si el usuario terminó la llamada
  // mientras la está grabando para darle la opción de guardarla
  // El state se mantiene en true mientras espera el guardado
  // y en este state las llamadas entrantes son rechazadas automáticamente
  const [endedWhileRecording, setEndedWhileRecording] = useState(false);

  /** Indicar si el usuario llamado está online */
  const isOnline = onlineUsers.find(user => user.userId === activeCallWith?.id);

  /**
   * Restablecer el state local, las variables locales
   * y el state global al desmontar el modal
   */
  const clearStateHandler = () => {
    setEndedWhileRecording(false);
    setIsRecording(false);
    setIsRecordingReady(false);
    setIsLocalStreamMuted(false);

    mediaRecorder = null;
    recordedChunks = [];

    dispatch(setVideoCall(null));
    dispatch(setActiveVideoCallData(null));
    dispatch(setUserVideoCallStatus("active"));
  };
  

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

  
  /*-----------------------------------------------------------------*/
  // Manejar el caso cuando el otro usuario finaliza la videollamada
  /*-----------------------------------------------------------------*/
  useEffect(() => {
    // Detener la grabación si hay grabación activa al terminar la videollamada
    if (videoCall?.status === "ended" && isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecordingReady(true);
      setEndedWhileRecording(true);
    };

    // Restablecer el state local y global si no hay llamada activa
    // cuando el usuario remoto finaliza la llamada
    if (videoCall?.status === "ended" && !isRecording) {
      toast.info(
        `${activeCallWith?.firstName} ended the video call`,
        {position: "bottom-left"}
      );

      clearStateHandler();
    }
  }, [videoCall, isRecording, mediaRecorder, activeCallWith]);


  /*-------------------------------------------------------*/
  // Mutear/desmutear el audio de la transmisión de salida
  /*-------------------------------------------------------*/
  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !isLocalStreamMuted;
    };
  }, [localStream, isLocalStreamMuted]);


  // Cerrar el modal y mostrar notificación toast
  // cuando el usuario remoto se desconecta
  useEffect(() => {
    if (activeCallWith && !isOnline) {
      dispatch(setVideoCall(null));
      dispatch(setActiveVideoCallData(null));
      dispatch(setUserVideoCallStatus("active"));

      toast.info(
        `Videocall ended as ${activeCallWith.firstName} has disconnected`,
        {position: "bottom-left"}
      );
    };
  }, [videoCall, activeCallWith, isOnline]);


  if (!videoCall || !activeCallWith) {
    return null;
  };


  /**
   * Aceptar la videollamada
   */
  const acceptVideoCallHandler = () => {
    if (!localStream) {
      return false;
    };

    videoCall.callObj!.answer(localStream);
    socketClient.socket.emit(SocketEvents.CALL_ACCEPTED, activeCallWith.id);    
    dispatch(setVideoCall({...videoCall, status: "accepted"}));
  };


  /**
   * Iniciar/terminar la grabación de la videollamada
   */
  const recordVideocallHandler = (mode: "start" | "stop") => {
    if (mode === "start" && remoteStream) {
      mediaRecorder = new MediaRecorder(remoteStream);
      mediaRecorder.start();
      setIsRecording(true);
    };
    
    if (mode === "stop" && mediaRecorder) {
      mediaRecorder.stop();
      recordedChunks = [];
      mediaRecorder = null;
      setIsRecording(false);
      setIsRecordingReady(true);
    };

    // Almacenar los chunks de la grabación a medida que van generándose
    mediaRecorder?.addEventListener("dataavailable", (e) => {
      recordedChunks.push(e.data);
    });

    // Escuchar el evento de grabación terminada
    // y generar la url de descarga de la misma
    mediaRecorder?.addEventListener("stop", () => {
      const blob = new Blob(recordedChunks, {type: "video/mp4"});
      const videoUrl = URL.createObjectURL(blob);
      downloadLinkRef.current?.setAttribute("href", videoUrl);
    });
  };


  /**
   * Finalizar la videollamada
   */
  const endVideoCallHandler = (mode: "end" | "reject") => {
    if (mode === "reject") {
      socketClient.socket.emit(SocketEvents.CALL_REJECTED, activeCallWith.id)
    } else {
      socketClient.socket.emit(SocketEvents.CALL_ENDED, activeCallWith.id)
    };

    videoCall.callObj!.close();
    localStream?.getTracks().forEach(track => track.stop());
    
    // Si está grabando la videollamada darle la opción
    // de guardar la grabación antes de cerrar el modal
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      return setEndedWhileRecording(true);
    };

    dispatch(setVideoCall(null));
    dispatch(setActiveVideoCallData(null));
    dispatch(setUserVideoCallStatus("active"));
    dispatch(setRemoteStream(null));
  };


  return (
    <div
      className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[10000]">
      <div
        className="relative flex justify-center items-center h-[95dvh] max-w-[98%] aspect-[4/3] p-6 rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Link de descarga de la videollamada grabada */}
        <a
          ref={downloadLinkRef}
          className="hidden"
          href=""
          download={`geocall_recorded_call_with_${activeCallWith.firstName}_${Date.now()}`}
        />

        {!endedWhileRecording && (videoCall.status === "calling" || videoCall.status === "pending") &&
          <div className="flex flex-col justify-center items-center gap-16">
            {/* Avatar y nombre de la persona que está llamando */}
            <div className="flex flex-col justify-center items-center gap-2">
              <img
                className="block w-[120px] h-[120px] object-cover object-center rounded-full border-4 border-blue-600"
                src={activeCallWith.avatar}
                alt={activeCallWith.firstName}
              />
              <p className="font-bold text-3xl text-center text-gray-600">
                {videoCall.status === "calling" && "Calling "}
                {activeCallWith.firstName}
                {videoCall.status === "pending" && " is calling..."}
              </p>
            </div>

            {/* Botones de aceptar y terminar/rechazar llamada */}
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
                  localStream!.getTracks().forEach(track => track.stop());
                  const mode = videoCall.status === "calling" ? "end" : "reject";
                  endVideoCallHandler(mode);
                }}
              >
                <HiOutlinePhoneMissedCall className="w-[60px] h-[60px] stroke-red-800" />
              </button>
            </div>
          </div>
        }

        {/* Indicar que el usuario no está disponible para llamadas y apagar la cámara */}
        {videoCall.status === "unavailable" && (
          <div className="flex flex-col justify-center items-center gap-6">
            <p className="font-bold text-3xl text-center text-gray-600">
              {activeCallWith.firstName} is not available at this moment.
            </p>
            <button
              className="block min-w-[150px] px-3 py-2 uppercase rounded-sm bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={() => {
                localStream?.getTracks().forEach(track => track.stop());
                dispatch(setVideoCall(null));
                dispatch(setActiveVideoCallData(null));
                dispatch(setUserVideoCallStatus("active"));
              }}
            >
              Accept
            </button>
          </div>
        )}

        {/* Dar la opción de guardar la videollamada si la terminó mientras la grababa*/}
        {endedWhileRecording && (
          <div className="flex flex-col justify-center items-center gap-6">
            <p className="font-bold text-3xl text-center text-gray-600">
              Save the recorded call?
            </p>
            <button
              className="block min-w-[150px] px-3 py-2 uppercase rounded-sm bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={() => {
                downloadLinkRef.current?.click();
                clearStateHandler();
              }}
            >
              Save and exit
            </button>

            <button
              className="block min-w-[150px] px-3 py-2 uppercase rounded-sm bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={clearStateHandler}
            >
              Exit without saving
            </button>
          </div>
        )}

        {/* Mostrar los streams si la video llamada es aceptada */}
        {videoCall.status === "accepted" && !endedWhileRecording && (
          <div className="flex flex-col justify-start items-center gap-6 h-full">
            {localStream && (
              <div className="flex flex-col justify-start items-center gap-3 mb-1">
                <p className="font-bold text-2xl text-center text-gray-600">
                  Active video call with {activeCallWith.firstName}
                </p>
                <div className="flex justify-stretch items-center gap-1 flex-shrink-0 min-w-[200px]">
                  <IconButton
                    Icon={!isLocalStreamMuted ? FaMicrophone : FaMicrophoneSlash}
                    disabled={false}
                    tooltipText={isLocalStreamMuted ? "Enable audio" : "Disable audio"}
                    onClickHandler={() => setIsLocalStreamMuted((prev) => !prev)}
                  />
                  <IconButton
                    Icon={HiPhoneMissedCall}
                    disabled={false}
                    tooltipText={`End videocall with ${activeCallWith.firstName}`}
                    onClickHandler={endVideoCallHandler.bind(null, "end")}
                  />
                  <IconButton
                    Icon={!isRecording ? BsFillRecordFill : BsFillStopFill}
                    disabled={false}
                    tooltipText={!isRecording ? "Start recording" : "Stop recording"}
                    onClickHandler={() => {
                      if (!isRecording) {
                        recordVideocallHandler("start");
                      } else {
                        recordVideocallHandler("stop");
                      }
                    }}
                  />
                  {isRecordingReady && !isRecording &&
                    <IconButton
                      Icon={HiDownload}
                      disabled={false}
                      tooltipText="Save videocall"
                      onClickHandler={() => {
                        downloadLinkRef.current?.click();
                        setIsRecordingReady(false);
                      }}
                    />
                  }
                </div>
              </div>
            )}

            <div className="relative w-full h-full">
              {/* Stream local */}
              <div className="absolute w-[250px] z-10">
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
              <div className="w-full h-full">
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