import { v4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { Chat, createOrSelectChat } from "../../redux/features/chatsSlice";
import { Notification } from "../../redux/features/notificationsSlice"
import { setSelectedUserPrefetch } from "../../redux/features/mapSlice";
import { RootState } from "../../redux/store";

interface Props {
  notification: Notification;
};

const NotificationItem = ({notification}: Props) => {
  const {senderData, recipientData, notificationType, unread} = notification;

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: RootState) => state.user);

  /**
   * Si la notificación es de tipo mensaje, seleccionar
   * el chatal clickear la notificación correspondiente
   */
  const onClickNotificationHandler = () => {
    const chat: Chat = {
      chatId: v4(),
      localUser: currentUser!._id,
      senderId: notification.senderId,
      recipientId: currentUser!._id,
      senderData,
      recipientData,
      messages: [],
      createdAt: new Date().toISOString()
    };

    dispatch(createOrSelectChat({chat, otherMember: senderData}));
    
    dispatch(setSelectedUserPrefetch({
      selectedUserId: notification.senderId
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
          src={senderData.avatar}
          alt={senderData.firstName}
        />
      </div>
      {notificationType === "incomingMessage" && (
        <p className="flex-grow max-w-[full] text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
          New message from {senderData.firstName}
        </p>
      )}
    </div>
  )
};

export default NotificationItem;