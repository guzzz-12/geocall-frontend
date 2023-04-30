import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TfiWorld } from "react-icons/tfi";
import { MdMailOutline, MdEmail, MdNotificationsNone, MdOutlineNotificationsOff } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import ChatsList from "./ChatsList";
import { ChatsRootState, NotificationsRootState, UserRootState } from "../redux/store";
import { api, useGetUsersMutation } from "../redux/api";
import { removeCurrentUser, setChatStatus } from "../redux/features/userSlice";
import { clearMapState } from "../redux/features/mapSlice";
import { setReadNotifications } from "../redux/features/notificationsSlice";
import { ChatMember, clearSelectedChatState } from "../redux/features/chatsSlice";
import { socketClient } from "../socket/socketClient";

interface Props {
  navbarType: "floating" | "static";
};

const Navbar = ({navbarType}: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {chats} = useSelector((state: ChatsRootState) => state.chats);
  const {chatStatus} = useSelector((state: UserRootState) => state.user);
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {unread} = useSelector((state: NotificationsRootState) => state.notifications);

  const [chatsMembersIds, setChatsMembersIds] = useState<string[]>([]);
  const [chatUsersData, setChatUsersData] = useState<ChatMember[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  /*------------------------------------------------*/
  // Consultar la data de los usuarios de los chats
  /*------------------------------------------------*/
  const [getUsers, {isLoading, isError}] = useGetUsersMutation();

  /*----------------------------------------------------*/
  // Extraer las ids de los participantes de cada chat
  /*----------------------------------------------------*/
  useEffect(() => {
    const userIds: string[] = [];

    if (currentUser && chats.length) {
      chats.forEach((chat) => {
        const {senderId, senderData, recipientData} = chat;
        const otherUser = senderId === currentUser._id ? recipientData : senderData;
        userIds.push(otherUser._id);
      })
    };

    setChatsMembersIds(userIds);
  }, [currentUser, chats]);

  /**
   * Cerrar la sesión del usuario,
   * resetear el state de RTK,
   * limpiar el state del usuario,
   * limpiar el state del mapa,
   * emitir evento logout de socket y
   * redirigir a la pantalla de login.
   */
  const logoutHandler = async () => {
    dispatch(api.util.resetApiState());
    dispatch(removeCurrentUser());
    dispatch(clearMapState());
    dispatch(clearSelectedChatState());
    socketClient.userLogout(currentUser!._id);
    navigate("/login", {replace: true});
  };
  
  /**
   * Cambiar el status de las notificaciones a leídas
   * y consultar la data de los usuarios de los chats.
   */
  const onClickNotificationsHandler = async () => {
    setIsNotificationsOpen((prev) => {      
      setTimeout(() => {
        dispatch(setReadNotifications())
      }, 1000);
      return !prev
    });

    try {
      setChatUsersData([]);
      const {users} = await getUsers({ids: chatsMembersIds}).unwrap();
      setChatUsersData(users);      
    } catch (error: any) {
      console.log(error.message)
    }
  };


  /**
   * Alternar la disponibilidad del usuario para chatear
   */
  const availabilityChangeHandler = () => {
    const currentChatStatus = chatStatus === "available" ? "unavailable" : "available";
    
    dispatch(setChatStatus(currentChatStatus));
    
    socketClient.setUserAvailability(currentUser!._id, currentChatStatus);
  };
  

  if (!currentUser) {
    return null;
  };


  // Contenedor de los elementos del navbar, el cual define el tipo de navbar
  const Wrapper = ({children}: {children: ReactNode}) => {
    // Navbar flotante
    if (navbarType === "floating") {
      return (
        <nav className="absolute top-2 left-[50%] mx-2 -translate-x-[50%] flex justify-between items-center w-[95%] max-w-[600px] px-3 py-2 rounded border border-gray-500 bg-slate-50 z-[2]">
          {children}
        </nav>
      )
    };

    // Navbar estático de ancho completo
    return (
      <nav className="w-full px-3 py-2 border-b bg-slate-50 shadow-sm">
        <div className="flex justify-between items-center container-md">
          {children}
        </div>
      </nav>
    )
  };

  
  /**
   * Generar tooltip especificando la ID.
   */
  const RenderTooltip = ({id}: {id: string}) => {
    return (
      <Tooltip
        style={{color: "black", background: "#f8fafc", zIndex: 30}}
        id={id}
        noArrow
      />
    )
  };


  return (
    <Wrapper>
      {/* Tooltips de los botones del navbar */}
      <RenderTooltip id="msg-button-tooltip" />
      <RenderTooltip id="user-button-tooltip" />
      <RenderTooltip id="status-button-tooltip" />
      <RenderTooltip id="logout-button-tooltip" />

      <Link className="flex justify-between items-center gap-2" to="/">
        <TfiWorld className="w-9 h-9 text-gray-400" />
        <h1 className="text-lg font-bold uppercase text-gray-600">
          GeoCall
        </h1>
      </Link>

      <div className="relative flex justify-center items-stretch gap-3">
        <ChatsList
          isOpen={isNotificationsOpen}
          isLoading={isLoading}
          isError={isError}
          chatUsersData={chatUsersData}
          setIsOpen={setIsNotificationsOpen}
        />

        <button
          className="relative flex justify-center items-center w-8 cursor-pointer"
          data-tooltip-id="msg-button-tooltip"
          data-tooltip-content="Messages"
          onClick={onClickNotificationsHandler}
        >
          {unread.length === 0 && (
            <MdMailOutline className="w-full h-full text-gray-600" />
          )}

          {unread.length > 0 && (
            <>
              <MdEmail className="w-full h-full text-gray-600" />
              <span className="absolute -top-1 -right-1 flex justify-center items-center w-5 h-5 rounded-full bg-orange-600">
                <span className="font-bold text-white text-sm">
                  {unread.length}
                </span>
              </span>
            </>
          )}
        </button>

        <Link
          className="flex justify-center items-center gap-2 rounded- cursor-pointer"
          to="/account"
          data-tooltip-id="user-button-tooltip"
          data-tooltip-content="Account"
        >
          <span className="block w-8 h-8 overflow-hidden">
            <img
              src={currentUser!.avatar}
              className="block w-full h-full object-cover object-center rounded-full outline-2 outline-blue-500"
            />
          </span>
          {/* <p className="text-base font-bold text-gray-600">
            {currentUser!.firstName}
          </p> */}
        </Link>

        {/* Botón para alternar la disponibilidad del usuario para chatear y recibir llamadas */}
        <button
          className="px-0 py-1 text-center text-base font-normal text-gray-600 uppercase rounded disabled:bg-slate-300 disabled:cursor-default transition-colors"
          data-tooltip-id="status-button-tooltip"
          data-tooltip-content={chatStatus === "available" ? "Set chat to unavailable" : "Set chat to available"}
          onClick={availabilityChangeHandler}
        >
          {chatStatus === "available" && <MdNotificationsNone className="w-8 h-8" />}
          {chatStatus === "unavailable" && <MdOutlineNotificationsOff className="w-8 h-8" />}
        </button>

        <button
          className="px-0 py-1 text-center text-base font-normal text-gray-600 uppercase rounded disabled:bg-slate-300 disabled:cursor-default transition-colors"
          data-tooltip-id="logout-button-tooltip"
          data-tooltip-content="Logout"
          onClick={logoutHandler}
        >
          <AiOutlineLogout className="w-8 h-8" />
        </button>
      </div>
    </Wrapper>
  )
};

export default Navbar;