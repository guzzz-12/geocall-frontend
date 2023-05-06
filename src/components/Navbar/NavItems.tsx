import { Link } from "react-router-dom";
import { MdEmail, MdMailOutline, MdNotificationsNone, MdOutlineNotificationsOff } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import { User } from "../../redux/api";
import { Notification } from "../../redux/features/notificationsSlice";
import { UserAvailability } from "../../redux/features/mapSlice";

interface Props {
  currentUser: User;
  unread: Notification[];
  chatStatus: UserAvailability;
  onClickNotificationsHandler: () => Promise<false | undefined>;
  availabilityChangeHandler: () => void;
  logoutHandler: () => void;
}

const NavItems = (props: Props) => {
  const {currentUser, unread, chatStatus, onClickNotificationsHandler, availabilityChangeHandler, logoutHandler} = props;

  return (
    <div
      className="relative flex flex-col justify-center items-start gap-5 xs:flex-row xs:items-center xs:gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <Link
        className="flex justify-center items-center gap-2 max-w-[120px] mx-auto cursor-pointer"
        to="/account"
        data-tooltip-id="user-button-tooltip"
        data-tooltip-content="Account"
      >
        <span className="block w-11 h-11 xs:w-8 xs:h-8 flex-shrink-0 rounded-full border-2 border-gray-400 overflow-hidden">
          <img
            src={currentUser!.avatar}
            className="block w-full h-full object-cover object-center "
          />
        </span>
        <p className="max-w-[100%] text-base font-bold text-gray-600 text-ellipsis whitespace-nowrap">
          {currentUser!.firstName}
        </p>
      </Link>

      <button
        className="flex justify-start xs:justify-center items-center text-gray-600 cursor-pointer"
        data-tooltip-id="msg-button-tooltip"
        data-tooltip-content="Messages"
        onClick={onClickNotificationsHandler}
      >
        {unread.length === 0 && (
          <MdMailOutline className="w-8 h-8 text-gray-600" />
        )}

        {unread.length > 0 && (
          <div className="relative">
            <MdEmail className="text-gray-600 w-8 h-8" />
            <span className="absolute -top-2 -right-1 xs:-top-1 xs:-right-1 flex justify-center items-center w-5 h-5 rounded-full bg-orange-600">
              <span className="font-bold text-white text-sm">
                {unread.length}
              </span>
            </span>
          </div>
        )}

        <p className="xs:hidden ml-2">
          Messages
        </p>
      </button>

      {/* Botón para alternar la disponibilidad del usuario para chatear y recibir llamadas */}
      <button
        className="flex justify-start xs:justify-center items-center text-gray-600 cursor-pointer"
        data-tooltip-id="status-button-tooltip"
        data-tooltip-content={chatStatus === "available" ? "Set chat to unavailable" : "Set chat to available"}
        onClick={availabilityChangeHandler}
      >
        {chatStatus === "available" && <MdNotificationsNone className="w-8 h-8" />}
        {chatStatus === "unavailable" && <MdOutlineNotificationsOff className="w-8 h-8" />}
        <p className="xs:hidden ml-2">
          Notifications
        </p>
      </button>

      <button
        className="flex justify-start xs:justify-center items-center text-gray-600 cursor-pointer"
        data-tooltip-id="logout-button-tooltip"
        data-tooltip-content="Logout"
        onClick={logoutHandler}
      >
        <AiOutlineLogout className="w-8 h-8" />
        <p className="xs:hidden ml-2">
          Logout
        </p>
      </button>
    </div>
  )
};

export default NavItems;