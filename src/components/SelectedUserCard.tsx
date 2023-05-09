import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { v4 } from "uuid";
import { Tooltip } from "react-tooltip";
import { GrClose } from "react-icons/gr";
import { AiOutlineWechat } from "react-icons/ai";
import { BiVideoPlus } from "react-icons/bi";
import { FiMail } from "react-icons/fi";
import { BsCalendar3 } from "react-icons/bs";
import { GoLocation } from "react-icons/go";
import { FaAddressCard, FaFacebookSquare, FaInstagram, FaTwitter } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { IconType } from "react-icons/lib";

import IconButton from "./IconButton";
import Spinner from "./Spinner";
import SocialLink from "./Account/SocialLink";
import useVideoCall from "../hooks/useVideoCall";
import useSelectedUser from "../hooks/useSelectedUser";
import { RootState } from "../redux/store";
import { setSelectedUser, setSelectedUserPrefetch } from "../redux/features/mapSlice";
import { createOrSelectChat, Chat } from "../redux/features/chatsSlice";
import { openImageModal } from "../redux/features/imageModalSlice";

interface Props {
  selectedUserId: string;
};

const SelectedUserCard = ({selectedUserId}: Props) => {
  const dispatch = useDispatch();
  const {currentUser, hasMediaDevice} = useSelector((state: RootState) => state.user);
  const {selectedUser, onlineUsers} = useSelector((state: RootState) => state.map);

  // Consultar la data del usuario seleccionado y actualizar el state global
  const {isLoading, isFetching} = useSelectedUser({selectedUserId, updateGlobalState: true});

  // Verificar si el usuario está offline
  const isUserOffline = !onlineUsers.find(user => user.userId === selectedUser?.user._id);

  // Funcionalidad para iniciar una videollamada
  const {videoCallHandler} = useVideoCall();

  /**
   * Crear el chat si no existe o abrirlo si ya existe
   */
  const onChatClickHandler = () => {
    const chat: Chat = {
      chatId: v4(),
      localUser: currentUser!._id,
      senderId: currentUser!._id,
      recipientId: selectedUserId,
      senderData: {
        _id: currentUser!._id,
        firstName: currentUser!.firstName,
        lastName: currentUser!.lastName,
        avatar: currentUser!.avatar,
      },
      recipientData: {
        _id: selectedUser!.user._id,
        firstName: selectedUser!.user.firstName,
        lastName: selectedUser!.user.lastName,
        avatar: selectedUser!.user.avatar,
      },
      messages: [],
      createdAt: new Date().toISOString()
    };

    dispatch(createOrSelectChat({
      chat,
      otherMember: {
        _id: selectedUser!.user._id,
        firstName: selectedUser!.user.firstName,
        lastName: selectedUser!.user.lastName,
        avatar: selectedUser!.user.avatar,
      }
    }));
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
    <div className="w-[300px] min-h-[500px] max-h-[500px] translate-y-[-50%] rounded-md border border-gray-500 bg-slate-50 scrollbar-thumb-gray-600 scrollbar-thin overflow-y-auto overflow-x-hidden">
      <div
        className="absolute top-1 right-1 p-1 cursor-pointer"
        onClick={() => {
          dispatch(setSelectedUserPrefetch({selectedUserId: null}))
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
          <div className="flex flex-col justify-center items-center w-full max-w-[100%] mb-4 p-4 bg-gradient-to-b from-transparent to-gray-300 shadow-sm">
            {/* Avatar del usuario */}
            <div
              className="w-32 h-32 shrink-0 rounded-full border-4 border-blue-600 bg-black overflow-hidden"
              onClick={() => dispatch(openImageModal(selectedUser.user.avatar))}
            >
              <Tooltip id="open-image-tooltip"/>
              <img
                className="block w-full h-full object-cover object-center hover:opacity-75 transition-opacity cursor-pointer"
                src={selectedUser.user.avatar}
                alt={selectedUser.user.firstName}
                data-tooltip-id="open-image-tooltip"
                data-tooltip-content="Open image"
              />
            </div>

            {/* Nombre y botones de mensaje y llamada */}
            <div className="flex flex-col justify-center items-center grow-0 max-w-[100%] overflow-hidden">
              <p
                className="max-w-[100%] font-semibold text-center text-2xl text-gray-700 text-ellipsis"
                title={`${selectedUser.user.firstName} ${selectedUser.user.lastName}`}
              >
                {selectedUser.user.firstName} {selectedUser.user.lastName}
              </p>

              <span className="block mb-4">
                @{selectedUser.user.username}
              </span>
              
              <div className="flex justify-between items-center gap-1 mb-2">
                <IconButton
                  Icon={AiOutlineWechat}
                  tooltipText={`Chat with ${selectedUser.user.firstName}`}
                  disabled={false}
                  onClickHandler={onChatClickHandler}
                />
                <IconButton
                  Icon={BiVideoPlus}
                  tooltipText={
                    !hasMediaDevice ? `Connect your camera to start a videocall with ${selectedUser.user.firstName}`
                    :
                    isUserOffline ? "The user is offline"
                    :
                    "Start videocall"
                  }
                  disabled={!hasMediaDevice || isUserOffline}
                  onClickHandler={videoCallHandler}
                />
              </div>

              {/* Links de las redes sociales */}
              <div className="flex justify-center items-center gap-3 w-full pt-2">
                {selectedUser.user.socialLinks.map((item) => {
                  const {_id, name, link} = item;
                  const icon = name === "instagram" ? FaInstagram : name === "facebook" ? FaFacebookSquare : FaTwitter;
                  return (
                    <SocialLink
                      key={_id}
                      Icon={icon}
                      name={name}
                      link={link}
                      size="sm"
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-start items-start gap-3 px-4 pb-5 text-base font-semibold">
            <UserMetadata Icon={FiMail} text={selectedUser.user.email} />
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