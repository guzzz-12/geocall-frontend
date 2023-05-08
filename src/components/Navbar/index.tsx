import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { AiOutlineMenu } from "react-icons/ai";

import Logo from "../Logo";
import NavItems from "./NavItems";
import Drawer from "./Drawer";
import ChatsList from "../ChatsList";
import { ChatsRootState, NotificationsRootState, UserRootState } from "../../redux/store";
import { api, useGetUsersMutation } from "../../redux/api";
import { removeCurrentUser, setChatStatus } from "../../redux/features/userSlice";
import { clearMapState } from "../../redux/features/mapSlice";
import { setReadNotifications } from "../../redux/features/notificationsSlice";
import { ChatMember, clearSelectedChatState } from "../../redux/features/chatsSlice";
import { socketClient } from "../../socket/socketClient";

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

  const [openDrawer, setOpenDrawer] = useState(() => false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  /*---------------------------------*/
  // Calcular el ancho de la ventana
  /*---------------------------------*/
  useEffect(() => {
    const listener = (e: Event) => {
      const innerWidth = (e.target as Window).innerWidth;
      setWindowWidth(innerWidth);
    };

    window.addEventListener("resize", listener);

    return () => {
      window.removeEventListener("resize", listener)
    }
  }, []);

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
  const logoutHandler = () => {
    // dispatch(api.util.resetApiState());
    socketClient.userLogout(currentUser!._id);
    dispatch(clearMapState());
    dispatch(removeCurrentUser());
    dispatch(clearSelectedChatState());
    navigate("/", {replace: true});
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

    // No realizar la consulta si no hay chats creados
    if (chatsMembersIds.length === 0) {
      return false;
    };

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
        <nav className="absolute top-2 left-[50%] mx-auto px-3 py-2 -translate-x-[50%] flex justify-between items-center w-full max-w-[600px] rounded border border-gray-500 bg-slate-50 z-[2]">
          {children}
        </nav>
      )
    };

    // Navbar estático de ancho completo
    return (
      <nav className="relative w-full px-3 py-2 border-b bg-slate-50 shadow-sm">
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
    <>
      {/* Drawer del menú de navegación responsive */}
      <AnimatePresence initial={false}>
        {openDrawer && windowWidth < 450 &&
          <motion.div
            key="drawerBg"
            className="fixed left-0 top-0 flex justify-end items-stretch w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[100000]"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setOpenDrawer(false)}
          >
            <motion.aside
              key="drawerContent"
              className="w-[250px] h-screen"
              initial={{x: "100%"}}
              animate={{x: 0}}
              exit={{x: "100%"}}
              transition={{bounce: 0.1}}
            >
              <Drawer
                currentUser={currentUser}
                chatUsersData={chatUsersData}
                isLoading={isLoading}
                unread={unread}
                chatStatus={chatStatus}
                isError={isError}
                isNotificationsOpen={isNotificationsOpen}
                setOpenDrawer={setOpenDrawer}
                setIsNotificationsOpen={setIsNotificationsOpen}
                onClickNotificationsHandler={onClickNotificationsHandler}
                availabilityChangeHandler={availabilityChangeHandler}
                logoutHandler={logoutHandler}
              />
            </motion.aside>
          </motion.div>
        }
      </AnimatePresence>

      <Wrapper>
        {/* Tooltips de los botones del navbar */}
        <RenderTooltip id="msg-button-tooltip" />
        <RenderTooltip id="user-button-tooltip" />
        <RenderTooltip id="status-button-tooltip" />
        <RenderTooltip id="logout-button-tooltip" />

        {windowWidth >= 450 &&
          <ChatsList
            isOpen={isNotificationsOpen}
            isLoading={isLoading}
            isError={isError}
            chatUsersData={chatUsersData}
            setIsOpen={setIsNotificationsOpen}
          />
        }

        <div className="hidden xs:block">
          <Logo size="sm" />
        </div>

        <div
          className="flex justify-center items-center xs:hidden w-10 h-10 p-2 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
          onClick={() => setOpenDrawer(prev => !prev)}
        >
          <AiOutlineMenu className="block w-7 h-7" />
        </div>

        <div className="hidden xs:block">
          <NavItems
            currentUser={currentUser}
            unread={unread}
            chatStatus={chatStatus}
            onClickNotificationsHandler={onClickNotificationsHandler}
            availabilityChangeHandler={availabilityChangeHandler}
            logoutHandler={logoutHandler}
          />
        </div>
      </Wrapper>
    </>
  )
};

export default Navbar;