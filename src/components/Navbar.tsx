import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TfiWorld } from "react-icons/tfi";
import { MdNotificationsNone, MdNotificationsActive } from "react-icons/md";
import { Tooltip } from "react-tooltip";

import NotificationsList from "./NotificationsList";
import { NotificationsRootState, UserRootState } from "../redux/store";
import { api, useLogoutUserMutation } from "../redux/api";
import { removeCurrentUser } from "../redux/features/userSlice";
import { clearMapState } from "../redux/features/mapSlice";
import { setReadNotifications } from "../redux/features/notificationsSlice";
import { socketClient } from "../socket/socketClient";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {all, unread} = useSelector((state: NotificationsRootState) => state.notifications);

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
  
  const onClickNotificationsHandler = () => {
    setIsNotificationsOpen((prev) => {      
      setTimeout(() => {
        dispatch(setReadNotifications())
      }, 1000);
      return !prev
    });
  };

  return (
    <nav className="absolute top-2 left-[50%] mx-2 -translate-x-[50%] flex justify-between items-center w-[95%] max-w-[600px] px-3 py-2 rounded border border-gray-500 bg-slate-50 z-[2]">
      <Tooltip id="notifications-tooltip" />
      <div className="flex justify-between items-center gap-2">
        <TfiWorld className="w-9 h-9 text-gray-400" />
        <h1 className="text-lg font-bold uppercase text-gray-600">
          GeoCall
        </h1>
      </div>
      <div className="relative flex justify-center items-stretch gap-4">
        <NotificationsList
          isOpen={isNotificationsOpen}
          notifications={all}
          setIsOpen={setIsNotificationsOpen}
        />
        <div className="flex justify-center items-center gap-2 px-2 py-1 border border-slate-400 rounded-md cursor-pointer">
          <div className="w-8 h-8 overflow-hidden">
            <img
              src={currentUser!.avatar}
              className="block w-full h-full object-cover object-center rounded-full outline-2 outline-blue-500"
            />
          </div>
          <p className="text-base font-bold text-gray-600">
            {currentUser!.firstName}
          </p>
        </div>

        <div
          className="relative flex justify-center items-center w-10 p-1 rounded-full border border-gray-500 cursor-pointer"
          data-tooltip-id="notifications-tooltip"
          data-tooltip-content="Notifications"
          onClick={onClickNotificationsHandler}
        >
          {unread.length === 0 && (
            <MdNotificationsNone className="w-full h-full text-gray-600" />
          )}

          {unread.length > 0 && (
            <>
              <MdNotificationsActive className="w-full h-full text-gray-600" />
              <div className="absolute -top-2 -right-2 flex justify-center items-center w-6 h-6 rounded-full bg-red-700">
                <span className="font-bold text-white text-sm">
                  {unread.length}
                </span>
              </div>
            </>
          )}

        </div>

        <button
          className="px-2 py-1 text-center text-base font-normal text-blue-600 uppercase rounded bg-blue-50 hover:bg-blue-100 disabled:bg-slate-300 disabled:cursor-default transition-colors"
          disabled={isLoading}
          onClick={logoutHandler}
        >
          Logout
        </button>
      </div>
    </nav>
  )
};

export default Navbar;