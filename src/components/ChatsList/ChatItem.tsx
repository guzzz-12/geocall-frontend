import { Dispatch, SetStateAction } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Chat, createOrSelectChat, setReadMessages } from "../../redux/features/chatsSlice";
import { MapRootState, UserRootState } from "../../redux/store";

interface Props {
  chat: Chat;
  setIsOpen: Dispatch<SetStateAction<boolean>>
};

const ChatItem = ({chat, setIsOpen}: Props) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {onlineUsers} = useSelector((state: MapRootState) => state.map);

  // Extraer la ID y la data del otro usuario de la conversación
  const otherUserId = chat.senderId === currentUser?._id ? chat.recipientId : chat.senderId;
  const otherUserData = chat.senderId === currentUser?._id ? chat.recipientData : chat.senderData;

  // Verificar si el usuario está online
  const isOnline = !!onlineUsers.find(user => user.userId === otherUserId);

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
    
    setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };


  return (
    <div
      className="flex justify-start items-center gap-2 w-full px-2 py-2 border-b border-gray-200 cursor-pointer overflow-hidden hover:bg-gray-100 transition-colors"
      onClick={onClickChatHandler}
    >

      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Avatar del usuario */}
        <img
          className="block w-full h-full object-cover object-center rounded-full border border-gray-300"
          src={otherUserData.avatar}
          alt={otherUserData.firstName}
        />

        {/* Indicador de status online */}
        <div
          style={{backgroundColor: isOnline ? "#16a34a" : "#9ca3af"}}
          className="absolute -bottom-[2px] right-[1px] w-[11px] h-[11px] rounded-full outline outline-2 outline-gray-100"
        />
      </div>

      <p className="flex-grow max-w-[full] text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
        Chat with <span className="font-bold">{otherUserData.firstName}</span>
      </p>

      {unreadMessages.length > 0 && (
        <p className="flex justify-center items-center w-5 h-5 ml-auto flex-shrink-0 text-sm text-white font-semibold rounded-full bg-orange-600">
          {unreadMessages.length}
        </p>
      )}
    </div>
  )
};

export default ChatItem;