import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TfiWorld } from "react-icons/tfi";
import { MdMailOutline, MdEmail, MdNotificationsNone, MdOutlineNotificationsOff } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import { Tooltip } from "react-tooltip";

import ChatsList from "./ChatsList";
import { NotificationsRootState, UserRootState } from "../redux/store";
import { api, useLogoutUserMutation } from "../redux/api";
import { removeCurrentUser, setChatStatus } from "../redux/features/userSlice";
import { clearMapState } from "../redux/features/mapSlice";
import { setReadNotifications } from "../redux/features/notificationsSlice";
import { socketClient } from "../socket/socketClient";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {chatStatus} = useSelector((state: UserRootState) => state.user);
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {unread} = useSelector((state: NotificationsRootState) => state.notifications);

  const [logoutUser, {isLoading}] = useLogoutUserMutation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  /**
   * Cerrar la sesión del usuario,
   * resetear el state de RTK,
   * limpiar el state del usuario,
   * limpiar el state del mapa,
   * emitir evento logout de socket y
   * redirigir a la pantalla de login.
   */
  const logoutHandler = async () => {
    await logoutUser();
    dispatch(api.util.resetApiState());
    dispatch(removeCurrentUser());
    dispatch(clearMapState());
    socketClient.userLogout(currentUser!._id);
    navigate("/login", {replace: true});
  };
  
  /**
   * Cambiar el status de las notificaciones a leídas
   */
  const onClickNotificationsHandler = () => {
    setIsNotificationsOpen((prev) => {      
      setTimeout(() => {
        dispatch(setReadNotifications())
      }, 1000);
      return !prev
    });
  };


  /**
   * Alternar la disponibilidad del usuario para chatear
   */
  const availabilityChangeHandler = () => {
    const currentChatStatus = chatStatus === "available" ? "unavailable" : "available";
    
    dispatch(setChatStatus(currentChatStatus));
    
    socketClient.setUserAvailability(currentUser!._id, currentChatStatus);
  };


  return (
    <nav className="absolute top-2 left-[50%] mx-2 -translate-x-[50%] flex justify-between items-center w-[95%] max-w-[600px] px-3 py-2 rounded border border-gray-500 bg-slate-50 z-[2]">
      {/* Tooltips de los botones del navbar */}
      <Tooltip id="msg-button-tooltip" noArrow style={{color: "black", background: "#f8fafc"}}/>
      <Tooltip id="user-button-tooltip" noArrow style={{color: "black", background: "#f8fafc"}} />
      <Tooltip id="status-button-tooltip" noArrow style={{color: "black", background: "#f8fafc"}} />
      <Tooltip id="logout-button-tooltip" noArrow style={{color: "black", background: "#f8fafc"}} />

      <div className="flex justify-between items-center gap-2">
        <TfiWorld className="w-9 h-9 text-gray-400" />
        <h1 className="text-lg font-bold uppercase text-gray-600">
          GeoCall
        </h1>
      </div>

      <div className="relative flex justify-center items-stretch gap-3">
        <ChatsList
          isOpen={isNotificationsOpen}
          setIsOpen={setIsNotificationsOpen}
        />

        <div
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
              <div className="absolute -top-1 -right-1 flex justify-center items-center w-5 h-5 rounded-full bg-orange-600">
                <span className="font-bold text-white text-sm">
                  {unread.length}
                </span>
              </div>
            </>
          )}
        </div>

        <div
          className="flex justify-center items-center gap-2 rounded-full cursor-pointer"
          data-tooltip-id="user-button-tooltip"
          data-tooltip-content="Account"
        >
          <div className="w-8 h-8 overflow-hidden">
            <img
              src={currentUser!.avatar}
              className="block w-full h-full object-cover object-center rounded-full outline-2 outline-blue-500"
            />
          </div>
          {/* <p className="text-base font-bold text-gray-600">
            {currentUser!.firstName}
          </p> */}
        </div>

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
          disabled={isLoading}
          data-tooltip-id="logout-button-tooltip"
          data-tooltip-content="Logout"
          onClick={logoutHandler}
        >
          <AiOutlineLogout className="w-8 h-8" />
        </button>
      </div>
    </nav>
  )
};

export default Navbar;