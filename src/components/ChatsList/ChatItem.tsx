import { useSelector, useDispatch } from "react-redux";
import useSelectedUser from "../../hooks/useSelectedUser";
import { Chat, createOrSelectChat, setReadMessages } from "../../redux/features/chatsSlice";
import { UserRootState } from "../../redux/store";

interface Props {
  chat: Chat;
};

const ChatItem = ({chat}: Props) => {
  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  // Extraer la ID del otro usuario de la conversación
  const otherUserId = chat.senderId === currentUser?._id ? chat.recipientId : chat.senderId;

  // Buscar los mensajes sin leer del otro usuario
  const unreadMessages = chat.messages.filter((msg) => msg.senderId === otherUserId && msg.unread);

  // Consultar la data del usuario seleccionado y actualizar el state global
  const {data, isLoading, isFetching} = useSelectedUser({selectedUserId: otherUserId});


  if (!currentUser) {
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
      {(isLoading || isFetching) && (
        <>
          <div className="animate-pulse w-10 h-10 flex-shrink-0 rounded-full border border-gray-500 bg-gray-300"/>
          <div className="animate-pulse flex-grow h-[40px] bg-gray-300" />
        </>
      )}

      {!isLoading && !isFetching && (
        <>
          <div className="w-10 h-10 flex-shrink-0 rounded-full border border-gray-300 overflow-hidden">
            <img
              className="block w-full h-full object-cover object-center"
              src={data?.user.avatar}
              alt={data?.user.firstName}
            />
          </div>

          <p className="flex-grow max-w-[full] text-sm text-left text-gray-700 text-ellipsis overflow-hidden">
            Chat with <span className="font-bold">{data?.user.firstName}</span>
          </p>

          {unreadMessages.length > 0 && (
            <p className="flex justify-center items-center w-5 h-5 ml-auto text-sm text-white font-semibold rounded-full bg-orange-700">
              {unreadMessages.length}
            </p>
          )}
        </>
      )}
    </div>
  )
};

export default ChatItem;