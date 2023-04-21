import { v4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Chat, createOrSelectChat } from "../../redux/features/chatsSlice";
import { Notification } from "../../redux/features/notificationsSlice"
import { setSelectedUserPrefetch } from "../../redux/features/mapSlice";
import { UserRootState } from "../../redux/store";

interface Props {
  notification: Notification;
};

const NotificationItem = ({notification}: Props) => {
  const {senderData: {firstName, avatar}, notificationType, unread} = notification;

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  /**
   * Si la notificación es de tipo mensaje, seleccionar
   * el chatal clickear la notificación correspondiente
   */
  const onClickNotificationHandler = () => {
    const chat: Chat = {
      chatId: v4(),
      senderId: notification.senderId,
      recipientId: currentUser!._id,
      messages: [],
      createdAt: new Date().toISOString()
    };

    dispatch(createOrSelectChat(chat));
    
    dispatch(setSelectedUserPrefetch({
      selectedUserId: notification.senderId,
      selectedUserSocketId: notification.senderSocketId
    }));

  };

  return (
    <div
      style={{backgroundColor: unread ? "#e0f2fe" : "transparent"}}
      className="flex justify-start items-center gap-2 w-full px-2 py-2 border-b border-gray-200 cursor-pointer transition-all overflow-hidden"
      onClick={onClickNotificationHandler}
    >
      <div className="w-10 h-10 flex-shrink-0 rounded-full border border-gray-300 overflow-hidden">
        <img
          className="block w-full h-full object-cover object-center"
          src={avatar}
          alt={firstName}
        />
      </div>
      {notificationType === "incomingMessage" && (
        <p className="flex-grow max-w-[full] text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
          New message from {firstName}
        </p>
      )}
    </div>
  )
};

export default NotificationItem;