import { Dispatch, SetStateAction } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatItemSkeleton from "./ChatItemSkeleton";
import { Chat, createOrSelectChat, setReadMessages } from "../../redux/features/chatsSlice";
import { MapRootState, UserRootState } from "../../redux/store";
import { useGetUserQuery } from "../../redux/api";

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

  const {data: otherUserData, isLoading, isFetching, isError} = useGetUserQuery(
    {userId: otherUserId!},
    {skip: !otherUserId, refetchOnMountOrArgChange: 20},
  );

  console.log({isLoading, isFetching});

  // Verificar si el usuario está online
  const isOnline = !!onlineUsers.find(user => user.userId === otherUserId);

  // Buscar los mensajes sin leer del otro usuario
  const unreadMessages = chat.messages.filter((msg) => msg.senderId === otherUserId && msg.unread);

  if (!currentUser || isError || (!otherUserData && !isLoading && !isFetching)) {
    return null
  };


  /**
   * Abrir la ventana del chat
   * Actualizar el unread de los mensajes a false
   */
  const onClickChatHandler = () => {
    if (!otherUserData) return false;
    
    const {_id, firstName, lastName, avatar} = otherUserData;
    dispatch(createOrSelectChat({chat, otherMember: {_id, firstName, lastName, avatar}}));
    dispatch(setReadMessages({chatId: chat.chatId}));
    
    setTimeout(() => {
      setIsOpen(false);
    }, 500);
  };


  return (
    <>
      {(isLoading || isFetching) && <ChatItemSkeleton />}
      {!isLoading && !isFetching &&
        <div
          className="flex justify-start items-center gap-2 w-full flex-shrink-0 px-2 py-2 border-b border-gray-200 cursor-pointer overflow-hidden hover:bg-gray-100 transition-colors"
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

          <p className="flex-grow max-w-[full] font-bold text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
            {otherUserData.firstName} {otherUserData.lastName}
          </p>

          {unreadMessages.length > 0 && (
            <p className="flex justify-center items-center w-5 h-5 ml-auto flex-shrink-0 text-sm text-white font-semibold rounded-full bg-orange-600">
              {unreadMessages.length}
            </p>
          )}
        </div>
      }
    </>
  )
};

export default ChatItem;