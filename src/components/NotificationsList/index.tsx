import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import NotificationItem from "./NotificationItem";
import { Notification } from "../../redux/features/notificationsSlice";
import { MapRootState } from "../../redux/store";

interface Props {
  isOpen: boolean;
  notifications: Notification[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const NotificationsList = ({isOpen, notifications, setIsOpen}: Props) => {
  const {onlineUsers} = useSelector((state: MapRootState) => state.map);

  /**
   * Filtrar los usuarios offline de la lista de notificaciones
   */
  const filteredOffline = notifications.filter((n) => {
    return onlineUsers.find((u) => u.userId === n.senderId)
  });

  if (!isOpen) {
    return null;
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-transparent z-1000"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="absolute flex flex-col -bottom-2 left-0 justify-stretch items-start w-[250px] min-h-min max-h-[300px] translate-y-[100%] bg-white rounded-b-md border border-gray-400 scrollbar-thin scrollbar-thumb-slate-500 overflow-y-auto z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {filteredOffline.length === 0 && (
          <div className="flex justify-center items-center self-center w-full p-3">
            <p className="flex-grow text-center">
              There are no new messages
            </p>
          </div>
        )}
        {filteredOffline.map(n => {
          return (
            <NotificationItem key={n.notificationId} notification={n} />
          )
        })}
      </div>
    </>
  )
};

export default NotificationsList;