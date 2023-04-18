import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { distance } from "@turf/turf";
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
import { SelectedUser, UserLocation, setSelectedUser } from "../redux/features/mapSlice";
import { useGetUserQuery } from "../redux/api";
import { MapRootState, UserRootState, VideoCallRootState } from "../redux/store";
import { createOrSelectChat, Chat } from "../redux/features/chatsSlice";
import { setRemoteStream, setVideoCall } from "../redux/features/videoCallSlice";
import peerClient from "../utils/peerClient";

interface Props {
  selectedUserId: string;
  selectedUserSocketId: string;
  myLocation: UserLocation;
  setSelectedUserId: Dispatch<SetStateAction<string | null>>
};

const SelectedUserCard = ({selectedUserId, selectedUserSocketId, myLocation, setSelectedUserId}: Props) => {
  const dispatch = useDispatch();
  const {currentuser} = useSelector((state: UserRootState) => state.user);
  const {onlineUsers, selectedUser} = useSelector((state: MapRootState) => state.map);
  const {localStream} = useSelector((state: VideoCallRootState) => state.videoCall);

  const [selectedUserLocation, setSelectedUserLocation] = useState<UserLocation | null>(null);
  const [selectedUserPeerId, setSelectedUserPeerId] = useState("");

  // Consultar la data del usuario seleccionado
  const {data, isLoading, isFetching} = useGetUserQuery(
    {userId: selectedUserId, location: selectedUserLocation!},
    {skip: !selectedUserId || !selectedUserSocketId || !selectedUserLocation}
  );

  // Buscar al usuario seleccionado en el state global
  // y extraer su ubicación y su peer id
  useEffect(() => {
    if (selectedUserId) {
      const {location, peerId} = onlineUsers.find(user => user.userId === selectedUserId)!;
      setSelectedUserLocation(location);
      setSelectedUserPeerId(peerId);
    }
  }, [selectedUserId]);

  // Calcular la distancia del usuario seleccionado
  // y actualizar el state global del usuario seleccionado
  useEffect(() => {
    if (selectedUserLocation && data && selectedUserSocketId) {
      const from = [myLocation.lat, myLocation.lon];
      const to = [selectedUserLocation.lat, selectedUserLocation.lon];
      const userDistance = distance(from, to, {units: "kilometers"});
      
      const selectedUser: SelectedUser = {
        user: data.user,
        socketId: selectedUserSocketId,
        peerId: selectedUserPeerId,
        location: selectedUserLocation,
        address: data.address,
        distance: `${(userDistance).toFixed(2)}km`,
      };

      dispatch(setSelectedUser(selectedUser));
    }
  }, [selectedUserLocation, data, selectedUserSocketId, myLocation]);


  /**
   * Crear el chat si no existe o abrirlo si ya existe
   */
  const onChatClickHandler = () => {
    const chat: Chat = {
      chatId: v4(),
      senderId: currentuser!._id,
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
    
    try {
      const call = peerClient.getInstance.call(recipientPeerId, localStream);

      dispatch(setVideoCall(call));
  
      call.on("error", (err) => {
        console.log(`Error initializing videocall with ${selectedUser.user.firstName}: ${err.message}`)
      });
  
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