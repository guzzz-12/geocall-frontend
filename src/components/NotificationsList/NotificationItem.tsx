import { Notification } from "../../redux/features/notificationsSlice"

interface Props {
  notification: Notification;
};

const NotificationItem = ({notification}: Props) => {
  const {senderData: {firstName, avatar}, notificationType, unread} = notification;

  return (
    <div
      style={{backgroundColor: unread ? "#e0f2fe" : "transparent"}}
      className="flex justify-start items-center gap-2 w-full px-2 py-2 border-b border-gray-200 cursor-pointer transition-all"
    >
      <div className="w-10 h-10 flex-shrink-0 rounded-full border border-gray-300 overflow-hidden">
        <img
          className="block w-full h-full object-cover object-center"
          src={avatar}
          alt={firstName}
        />
      </div>
      {notificationType === "incomingMessage" && (
        <p className="flex-grow text-sm text-left text-gray-700">
          New message from {firstName}
        </p>
      )}
    </div>
  )
};

export default NotificationItem;