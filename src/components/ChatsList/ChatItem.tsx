import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChatMember, createOrSelectChat, setReadMessages } from "../../redux/features/chatsSlice";
import { ChatsRootState, MapRootState, UserRootState } from "../../redux/store";
import { SocketEvents, socketClient } from "../../socket/socketClient";

interface Props {
  chatMember: ChatMember;
  setIsOpen: Dispatch<SetStateAction<boolean>>
};

const ChatItem = ({chatMember, setIsOpen}: Props) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {onlineUsers} = useSelector((state: MapRootState) => state.map);
  const {chats} = useSelector((state: ChatsRootState) => state.chats);

  const [isTyping, setIsTyping] = useState(false);


  /*--------------------------------*/
  // Escuchar evento de escribiendo
  /*--------------------------------*/
  useEffect(() => {
    socketClient.socket.on(SocketEvents.TYPING, (data: {senderId: string, typing: boolean}) => {
      const {senderId, typing} = data;

      if (senderId === chatMember._id) {
        setIsTyping(typing)
      }
    });

  }, [chatMember]);


  // Buscar el chat en el state global de los chats
  const chat = chats.find(item => (
    item.localUser === currentUser?._id &&
    (item.senderId === chatMember._id || item.recipientId === chatMember._id)
  ));

  // Retornar si no existe el chat
  if (!chat) {
    return null
  };

  // Verificar si el usuario está online
  const isOnline = !!onlineUsers.find(user => user.userId === chatMember._id);

  // Buscar los mensajes sin leer del otro usuario
  const unreadMessages = chat.messages.filter((msg) => msg.senderId === chatMember._id && msg.unread);


  /**
   * Abrir la ventana del chat
   * Actualizar el unread de los mensajes a false
   */
  const onClickChatHandler = () => {
    dispatch(createOrSelectChat({
      chat,
      otherMember: chatMember
    }));

    dispatch(setReadMessages({chatId: chat.chatId}));
    
    setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };


  return (
    <li
      className="flex justify-start items-center gap-2 w-full min-h-[60px] flex-shrink-0 px-2 py-2 border-b border-gray-200 cursor-pointer overflow-hidden hover:bg-gray-100 transition-colors"
      onClick={onClickChatHandler}
    >
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Avatar del usuario */}
        <img
          className="block w-full h-full object-cover object-center rounded-full border border-gray-300"
          src={chatMember.avatar}
          alt={chatMember.firstName}
        />

        {/* Indicador de status online */}
        <div
          style={{backgroundColor: isOnline ? "#16a34a" : "#9ca3af"}}
          className="absolute -bottom-[2px] right-[1px] w-[11px] h-[11px] rounded-full outline outline-2 outline-gray-100"
        />
      </div>

      {/* Nombre e indicador de escribiendo */}
      <div className="flex flex-col justify-center items-start flex-grow w-full overflow-hidden">
        <p className="max-w-[100%] font-bold text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
          {chatMember.firstName} {chatMember.lastName}
        </p>
        {isTyping &&
          <span className="text-xs text-gray-600 italic">
            User is typing...
          </span>
        }
      </div>

      {/* Número de mensajes sin leer */}
      {unreadMessages.length > 0 && (
        <p className="flex justify-center items-center w-5 h-5 ml-auto flex-shrink-0 text-sm text-white font-semibold rounded-full bg-orange-600">
          {unreadMessages.length}
        </p>
      )}
    </li>
  )
};

export default ChatItem;