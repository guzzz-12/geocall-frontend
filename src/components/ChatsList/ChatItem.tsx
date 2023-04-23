import { useSelector, useDispatch } from "react-redux";
import { Chat, createOrSelectChat, setReadMessages } from "../../redux/features/chatsSlice";
import { UserRootState } from "../../redux/store";

interface Props {
  chat: Chat;
};

const ChatItem = ({chat}: Props) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  // Extraer la ID y la data del otro usuario de la conversación
  const otherUserId = chat.senderId === currentUser?._id ? chat.recipientId : chat.senderId;
  const otherUserData = chat.senderId === currentUser?._id ? chat.recipientData : chat.senderData;

  // Buscar los mensajes sin leer del otro usuario
  const unreadMessages = chat.messages.filter((msg) => msg.senderId === otherUserId && msg.unread);

  if (!currentUser || !otherUserData) {
    return null
  };


  /**
   * Abrir la ventana del chat
   * Actualizar el unread de los mensajes a false
   */
  const onClickChatHandler = () => {
    dispatch(createOrSelectChat(chat));
    dispatch(setReadMessages({chatId: chat.chatId}));
  };


  return (
    <div
      className="flex justify-start items-center gap-2 w-full px-2 py-2 border-b border-gray-200 cursor-pointer transition-all overflow-hidden"
      onClick={onClickChatHandler}
    >

      <div className="w-10 h-10 flex-shrink-0 rounded-full border border-gray-300 overflow-hidden">
        <img
          className="block w-full h-full object-cover object-center"
          src={otherUserData.avatar}
          alt={otherUserData.firstName}
        />
      </div>

      <p className="flex-grow max-w-[full] text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
        Chat with <span className="font-bold">{otherUserData.firstName}</span>
      </p>

      {unreadMessages.length > 0 && (
        <p className="flex justify-center items-center w-5 h-5 ml-auto text-sm text-white font-semibold rounded-full bg-orange-700">
          {unreadMessages.length}
        </p>
      )}
    </div>
  )
};

export default ChatItem;