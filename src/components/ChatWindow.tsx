import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 } from "uuid";
import { GrClose } from "react-icons/gr";
import { FiSend } from "react-icons/fi";
import MessageItem from "./MessageItem";
import { ChatsRootState, UserRootState } from "../redux/store";
import { Message, closeChat, createMessage } from "../redux/features/chatsSlice";
import { socketClient } from "../socket/socketClient";
import { Notification } from "../redux/features/notificationsSlice";

const ChatWindow = () => {
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {selectedChat} = useSelector((state: ChatsRootState) => state.chats);

  const [messageText, setMessageText] = useState("");

  // Extraer la ID del otro usuario de la conversación
  const otherUserId = selectedChat?.senderId === currentUser?._id ? selectedChat?.recipientId : selectedChat?.senderId;

  // Extraer la data del otro usuario de la conversación
  const otherUserData = selectedChat?.recipientId === currentUser?._id ? selectedChat?.senderData : selectedChat?.recipientData;


  /*----------------------------------------------------------------*/
  // Scrollear al bottom de la ventana al recibir un nuevo mensaje
  /*----------------------------------------------------------------*/
  useEffect(() => {
    if (selectedChat) {
      chatBottomRef.current?.scrollIntoView({behavior: "smooth"});
    }
  }, [selectedChat]);

  const onCloseHandler = () => {
    dispatch(closeChat())
  };


  const onNewMessageHandler = () => {
    if (!otherUserData || !otherUserId) {
      return false;
    };

    const msg: Message = {
      chatId: selectedChat!.chatId,
      messageId: v4(),
      senderId: currentUser!._id,
      recipientId: otherUserId,
      senderData: {
        firstName: currentUser!.firstName,
        lastName: currentUser!.lastName,
        avatar: currentUser!.avatar,
      },
      recipientData: otherUserData,
      content: messageText,
      unread: true,
      createdAt: new Date().toISOString()
    };

    const notification: Notification = {
      notificationId: v4(),
      notificationType: "incomingMessage",
      receiverId: otherUserId,
      senderId: currentUser!._id,
      senderData: {
        firstName: currentUser!.firstName,
        lastName: currentUser!.lastName,
        avatar: currentUser!.avatar,
      },
      unread: true
    };

    socketClient.newMessage(msg);
    socketClient.newNotification(notification);

    dispatch(createMessage({chatId: selectedChat!.chatId, message: msg}));
    setMessageText("");
  };

  if (!selectedChat || !currentUser || !selectedChat || !otherUserData) {
    return null;
  };


  return (
    <div className="absolute right-2 bottom-0 flex flex-col w-[330px] h-[450px] rounded-t-lg bg-slate-100 overflow-hidden z-10">
      <div className="flex justify-between items-stretch w-full px-3 py-2 flex-shrink-0 border-b border-gray-400 bg-gray-300">
        <div className="flex justify-start items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-gray-500 overflow-hidden">
            <img
              className="block w-full h-full object-cover object-center"
              src={otherUserData.avatar}
              alt={otherUserData.firstName}
            />
          </div>
          <p className="font-semibold text-lg">
            {otherUserData.firstName} {otherUserData.lastName}
          </p>
        </div>
        <div className="flex justify-center items-center ml-auto cursor-pointer">
          <GrClose
            className="w-5 h-5"
            onClick={onCloseHandler}
          />
        </div>
      </div>

      <div
        className="w-full flex-grow p-3 scrollbar-thin scrollbar-thumb-slate-500 overflow-y-auto"
      >
        <div className="relative flex flex-col justify-start gap-4">
          {selectedChat.messages.map(msg => {
            return (
              <MessageItem
                key={msg.messageId}
                message={msg}
                currentUser={currentUser}
              />
            )
          })}
          
          {/* Elemento vacío para referencia del scroll to bottom */}
          <div ref={chatBottomRef} className="absolute bottom-0" />
        </div>
      </div>
      
      <div className="relative w-full flex-shrink-0 pr-7 border-t border-gray-400 bg-white">
        <textarea
          className="w-full px-2 py-3 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-500"
          placeholder="Type your message..."
          cols={2}
          value={messageText}
          onChange={(e) => setMessageText(e.currentTarget.value)}
        />
        <FiSend
          className={`absolute block right-1 top-[50%] w-6 h-6 translate-y-[-50%] cursor-pointer z-10`}
          onClick={(e) => {
            e.stopPropagation();

            if (!messageText.trim().length) {
              return false
            };

            onNewMessageHandler();
          }}
        />
      </div>
    </div>
  )
};

export default ChatWindow;