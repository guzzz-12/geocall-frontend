import { Dispatch, SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { GrClose } from "react-icons/gr";
import { AiOutlineWechat } from "react-icons/ai";
import { MdVideocam } from "react-icons/md";
import { FiMail } from "react-icons/fi";
import { HiAtSymbol } from "react-icons/hi";
import { BsCalendar3 } from "react-icons/bs";
import { GoLocation } from "react-icons/go";
import { FaAddressCard } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { IconType } from "react-icons/lib";

import IconButton from "./IconButton";
import Spinner from "./Spinner";
import { UserLocation, setSelectedUser } from "../redux/features/mapSlice";
import { MapRootState, UserRootState, VideoCallRootState } from "../redux/store";
import { createOrSelectChat, Chat } from "../redux/features/chatsSlice";
import { VideoCallData, setActiveVideoCallData, setRemoteStream, setVideoCall } from "../redux/features/videoCallSlice";
import peerClient from "../utils/peerClient";
import { socketClient } from "../socket/socketClient";
import useSelectedUser from "../hooks/useSelectedUser";

interface Props {
  selectedUserId: string;
  selectedUserSocketId: string;
  myLocation: UserLocation;
  setSelectedUserId: Dispatch<SetStateAction<string | null>>
};

const SelectedUserCard = ({selectedUserId, selectedUserSocketId, setSelectedUserId}: Props) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {selectedUser} = useSelector((state: MapRootState) => state.map);
  const {localStream} = useSelector((state: VideoCallRootState) => state.videoCall);

  // Consultar la data del usuario seleccionado y actualizar el state global
  const {isLoading, isFetching} = useSelectedUser({selectedUserId, selectedUserSocketId});


  /**
   * Crear el chat si no existe o abrirlo si ya existe
   */
  const onChatClickHandler = () => {
    const chat: Chat = {
      chatId: v4(),
      senderId: currentUser!._id,
      recipientId: selectedUserId,
      messages: [],
      createdAt: new Date().toISOString()
    };

    dispatch(createOrSelectChat(chat));
  };


  /**
   * Iniciar una videollamada con el usuario seleccionado
   */
  const onVideoCallClickHandler = () => {
    if (!localStream || !selectedUser) {
      return false;
    };

    const recipientPeerId = selectedUser.peerId;

    const videoCallData: VideoCallData = {
      remitent: {
        id: currentUser!._id,
        socketId: socketClient.socket.id,
        firstName: currentUser!.firstName,
        username: currentUser!.username,
        avatar: currentUser!.avatar
      },
      recipient: {
        id: selectedUser.user._id,
        socketId: selectedUser.socketId,
        firstName: selectedUser.user.firstName,
        username: selectedUser.user.username,
        avatar: selectedUser.user.avatar
      }
    };
    
    try {
      const call = peerClient.getInstance.call(recipientPeerId, localStream);

      // Almacenar el objeto call en el state global
      // para acceder a éste desde el resto de la app
      dispatch(setVideoCall(call));

      // Almacenar la data del usuario recipiente en el state global
      dispatch(setActiveVideoCallData(videoCallData.recipient));

      // Emitir el evento de videollamada al usuario recipiente
      socketClient.videoCall(videoCallData);
  
      call.on("error", (err) => {
        console.log(`Error initializing videocall with ${selectedUser.user.firstName}: ${err.message}`)
      });
  
      // Almacenar el stream remoto en el state global
      // cuando el usuario recipiente acepta la llamada
      call.on("stream", (remoteStream) => {
        console.log(`Videocall with ${selectedUser.user.firstName} initialized`);
        dispatch(setRemoteStream(remoteStream));
      });
      
    } catch (err: any) {
      console.log(`Error initializing videocall with ${selectedUser.user.firstName}: ${err.message}`);
    }
  };


  const UserMetadata = ({Icon, text}: {Icon: IconType, text: string}) => {
    return (
      <p className="flex justify-start items-center gap-3">
        <Icon className="w-5 h-5 shrink-0 text-gray-500" />
        {text}
      </p>
    )
  };
  

  return (
    <div className="w-[300px] min-h-[400px] max-h-[500px] translate-y-[-50%] rounded-md border border-gray-500 bg-slate-50 scrollbar-thumb-gray-600 scrollbar-thin overflow-y-auto overflow-x-hidden">
      <div
        className="absolute top-1 right-1 p-1 cursor-pointer"
        onClick={() => {
          setSelectedUserId(null);
          dispatch(setSelectedUser(null));
        }}
      >
        <GrClose className="w-5 h-5 opacity-60" />
      </div>

      {(isLoading || isFetching) && (
        <Spinner
          size="medium"
          spinnerInfo="Fetching user data..."
        />
      )}

      {!isLoading && selectedUser && (
        <div className="flex flex-col justify-start items-center w-full max-w-full h-full">
          <div className="flex justify-center items-center gap-4 w-full max-w-[100%] mb-4 p-4 bg-gradient-to-b from-transparent to-gray-300 shadow-sm">
            {/* Avatar del usuario */}
            <div className="w-32 h-32 shrink-0 rounded-full border-4 border-blue-600 overflow-hidden">
              <img
                className="block w-full h-full object-cover object-center"
                src={selectedUser.user.avatar}
                alt={selectedUser.user.firstName}
              />
            </div>

            {/* Nombre y botones de mensaje y llamada */}
            <div className="flex flex-col justify-center items-center grow-0 gap-2 w-[50%] max-w-[50%] overflow-hidden">
              <p
                className="max-w-[100%] font-semibold text-center text-2xl overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-700"
                title={`${selectedUser.user.firstName} ${selectedUser.user.lastName}`}
              >
                {selectedUser.user.firstName} {selectedUser.user.lastName}
              </p>
              <div className="flex justify-between items-center gap-1">
                <IconButton
                  Icon={AiOutlineWechat}
                  tooltipText={`Chat with ${selectedUser.user.firstName}`}
                  disabled={false}
                  onClickHandler={onChatClickHandler}
                />
                <IconButton
                  Icon={MdVideocam}
                  tooltipText={
                    !localStream ? `Connect your camera to start a videocall with ${selectedUser.user.firstName}`
                    :
                    "Start videocall"
                  }
                  disabled={!localStream}
                  onClickHandler={onVideoCallClickHandler}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-3 px-4 pb-5 text-base font-semibold">
            <UserMetadata Icon={FiMail} text={selectedUser.user.email} />
            <UserMetadata Icon={HiAtSymbol} text={selectedUser.user.username} />
            <UserMetadata
              Icon={BsCalendar3}
              text={`In GeoCall since ${dayjs(selectedUser.user.createdAt).format("MM/DD/YYYY")}`}
            />
            <UserMetadata
              Icon={GoLocation}
              text={`${selectedUser.location.lat}, ${selectedUser.location.lon}`}
            />
            <UserMetadata Icon={FaAddressCard} text={selectedUser.address} />
            <UserMetadata Icon={GiPathDistance} text={selectedUser.distance} />
          </div>
        </div>
      )}
    </div>
  )
};

export default SelectedUserCard;