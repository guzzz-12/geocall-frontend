import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 } from "uuid";
import { GrClose } from "react-icons/gr";
import { FiSend } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { BsImage } from "react-icons/bs";
import MessageItem from "./MessageItem";
import { ChatsRootState, UserRootState } from "../redux/store";
import { Message, closeChat, createMessage } from "../redux/features/chatsSlice";
import { socketClient } from "../socket/socketClient";
import { Notification } from "../redux/features/notificationsSlice";
import { imageResizer } from "../utils/imgResizer";

const ChatWindow = () => {
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {selectedChat} = useSelector((state: ChatsRootState) => state.chats);

  const [messageText, setMessageText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);

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


  /**
   * Enviar el mensaje
   */
  const onNewMessageHandler = () => {
    if (!otherUserData || !otherUserId || !messageText.trim().length && !imageData) {
      return false
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
      attachment: imageData,
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
    setImageData(null);
  };

  
  /**
   * Seleccionar una imagen
   */
  const onImagePickHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if(files) {
      const file = files[0];
      const imageBase64 = await imageResizer(file);
      setImageData(imageBase64);
    };

    // Limpiar el ref del input luego de seleccionar la imagen
    // para restablecer el evento change del input.
    if(fileInputRef.current) {
      fileInputRef.current.value = ""
    };
  };


  if (!selectedChat || !currentUser || !selectedChat || !otherUserData) {
    return null;
  };


  return (
    <div className="absolute right-2 bottom-0 flex flex-col w-[330px] h-[450px] rounded-t-lg bg-slate-100 overflow-hidden z-10">
      {/* Header de la bandeja */}
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

      {/* Bandeja con la lista de mensajes */}
      <div
        className="w-full flex-grow p-3 scrollbar-thin scrollbar-thumb-gray-400 overflow-y-auto"
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
      
      {/* Input y botonera */}
      <div className="relative flex flex-col w-full flex-shrink-0 border-t border-gray-400 bg-white">
        {/* Preview de la imagen seleccionada */}
        {imageData && (
          <div className="absolute -top-16 left-3 w-14 h-14 p-[2px] rounded-md border border-gray-400">
            <FaTimesCircle
              className="absolute -top-2 -left-2 w-4 h-4 rounded-full fill-red-500 bg-white cursor-pointer"
              onClick={() => setImageData(null)}
            />
            <img
              className="block w-full h-full object-cover object-center rounded-md"
              src={imageData}
              alt={"Picked image"}
            />
          </div>
        )}

        <textarea
          className="block w-full min-h-[70px] mb-1 px-2 pt-1 flex-grow resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-500"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.currentTarget.value)}
        />
        <div className="flex justify-end items-center gap-3 mt-1 pr-3 py-1 flex-shrink-0 border border-t border-gray-200">
          <Tooltip id="send-message-button" />
          <Tooltip id="select-image-button" />

          {/* Input del selector de imágenes */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple={false}
            accept="image/png, image/jpg, image/jpeg"
            onChange={onImagePickHandler}
          />

          <BsImage
            className="w-[27px] h-[27px] opacity-80 cursor-pointer"
            data-tooltip-id="select-image-button"
            data-tooltip-content="Add image"
            onClick={() => fileInputRef.current?.click()}
          />
          <FiSend
            className="w-[27px] h-[27px] opacity-80 cursor-pointer"
            data-tooltip-id="send-message-button"
            data-tooltip-content="Send message"
            onClick={onNewMessageHandler}
          />
        </div>
      </div>
    </div>
  )
};

export default ChatWindow;