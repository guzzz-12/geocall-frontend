import { useDispatch, useSelector } from "react-redux";
import { MediaConnection } from "peerjs";
import { toast } from "react-toastify";
import useSelectedUser from "./useSelectedUser";
import { RootState } from "../redux/store";
import { VideoCallData, setActiveVideoCallData, setLocalStream, setRemoteStream, setVideoCall } from "../redux/features/videoCallSlice";
import { setUserVideoCallStatus } from "../redux/features/userSlice";
import { socketClient } from "../socket/socketClient";
import peerClient from "../utils/peerClient";
import { getLocalStream } from "../utils/getLocalStream";


/**
 * Custom hook para iniciar videollamadas con el usuario seleccionado
 */
const useVideoCall = () => {
  const dispatch = useDispatch();
  const {currentUser, hasMediaDevice} = useSelector((state: RootState) => state.user);
  const {selectedUser, onlineUsers} = useSelector((state: RootState) => state.map);
  const {selectedChat} = useSelector((state: RootState) => state.chats);

  // Extraer la id y la data del otro usuario de la conversación
  let selectedUserId: string | null = null;

  // Si hay selectedUser, extraer su ID
  // Si hay selectedChat, extraer la ID del usuario remoto
  if (selectedUser) {
    selectedUserId = selectedUser.user._id;

  } else if (selectedChat) {
    selectedUserId = selectedChat.senderId === currentUser?._id ? selectedChat.recipientId : selectedChat.senderId;
  };

  // Consultar la data del usuario seleccionado
  const {data: userData, isLoading, isFetching} = useSelectedUser({
    selectedUserId: selectedUserId!,
    updateGlobalState: false
  });

  // Peer id del usuario remoto
  const peerId = onlineUsers.find(user => user.userId === userData?.user._id)?.peerId;

  // Verificar si el usuario está online
  const isUserOnline = onlineUsers.find(user => user.userId === userData?.user._id);

  /**
   * Iniciar la videollamada con el usuario seleccionado.
   * Para que sea posible realizar la videollamada
   * debe existir un usuario seleccionado
   * o un chat seleccionado en el state global.
   */
  const videoCallHandler = async () => {
    if (!hasMediaDevice || !userData || !isUserOnline || !peerId) {
      return;
    };

    const videoCallData: VideoCallData = {
      remitent: {
        id: currentUser!._id,
        firstName: currentUser!.firstName,
        avatar: currentUser!.avatar
      },
      recipient: {
        id: userData.user._id,
        firstName: userData.user.firstName,
        avatar: userData.user.avatar
      }
    };

    let call: MediaConnection | null = null;
    let myStream: MediaStream | null = null;
    
    try {
      // Intentar iniciar la videollamada
      // y almacenar el stream en el state global
      myStream = await getLocalStream();
      call = peerClient.getInstance.call(peerId, myStream);
      dispatch(setLocalStream(myStream));

    } catch (err: any) {
      console.log(`Error initializing videocall with ${userData.user.firstName}: ${err.message}`);

      myStream?.getTracks().forEach(track => track.stop());

      // Restaurar el state de la videollamada en caso de error
      dispatch(setUserVideoCallStatus("active"));
      dispatch(setActiveVideoCallData(null));
      dispatch(setVideoCall(null));
      setLocalStream(null);

      // Cerrar la videollamada en caso de error
      if (call) {
        call.close()
      };

      return;
    };

    if (!call) {
      return;
    };

    // Almacenar el objeto call en el state global
    // para acceder a éste desde el resto de la app
    dispatch(setVideoCall({callObj: call, status: "calling"}));

    // Almacenar la data del usuario recipiente en el state global
    dispatch(setActiveVideoCallData({
      id: userData.user._id,
      firstName: userData.user.firstName,
      avatar: userData.user.avatar
    }));

    // Pasar el status del usuario a busy
    dispatch(setUserVideoCallStatus("busy"));

    // Emitir el evento de videollamada al usuario recipiente
    socketClient.videoCall(videoCallData);

    call.on("error", (err) => {
      console.log(`Error initializing videocall with ${userData.user.firstName}: ${err.message}`);

      // Mostrar notificación de error de llamada
      toast.error(
        "Error establishing connection with the user. Refresh the page and try again...",
        {
          position: "bottom-right"
        }
      );
    });

    // Almacenar el stream remoto en el state global
    // cuando el usuario recipiente acepta la llamada
    call.on("stream", (remoteStream) => {
      console.log(`Videocall with ${userData.user.firstName} initialized`);
      dispatch(setRemoteStream(remoteStream));
    });
  };

  return {videoCallHandler, isLoading, isFetching}
};

export default useVideoCall;