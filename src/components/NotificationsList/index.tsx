import { Dispatch, SetStateAction } from "react";
import NotificationItem from "./NotificationItem";
import { Notification } from "../../redux/features/notificationsSlice";

interface Props {
  isOpen: boolean;
  notifications: Notification[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const NotificationsList = ({isOpen, notifications, setIsOpen}: Props) => {
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
        {notifications.length === 0 && (
          <div className="flex justify-center items-center self-center w-full p-3">
            <p className="flex-grow text-center">
              There are no notifications
            </p>
          </div>
        )}
        {notifications.map(n => {
          return (
            <NotificationItem key={n.notificationId} notification={n} />
          )
        })}
      </div>
    </>
  )
};

export default NotificationsList;