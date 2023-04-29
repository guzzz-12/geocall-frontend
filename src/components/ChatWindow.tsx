import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { v4 } from "uuid";
import { GrClose } from "react-icons/gr";
import { FiSend } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { BsImage, BsEmojiSmile } from "react-icons/bs";
import MessageItem from "./MessageItem";
import EmojiPicker from "./EmojiPicker";
import { ChatsRootState, MapRootState, UserRootState } from "../redux/store";
import { Message, closeChat, createMessage } from "../redux/features/chatsSlice";
import { Notification } from "../redux/features/notificationsSlice";
import { imageResizer } from "../utils/imgResizer";
import { socketClient } from "../socket/socketClient";

const ChatWindow = () => {
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {selectedChat} = useSelector((state: ChatsRootState) => state.chats);
  const {onlineUsers} = useSelector((state: MapRootState) => state.map);

  const [messageText, setMessageText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);

  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  // Extraer la ID del otro usuario de la conversación
  const otherUserId = selectedChat?.senderId === currentUser?._id ? selectedChat?.recipientId : selectedChat?.senderId;

  // Extraer la id y la data del otro usuario de la conversación
  const otherUserData = selectedChat?.recipientId === currentUser?._id ? selectedChat?.senderData : selectedChat?.recipientData;

  // Verificar si el usuario está online
  const isUserOnline = onlineUsers.find(user => user.userId === otherUserId);


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
    if (
      !otherUserData ||
      !otherUserId ||
      !isUserOnline ||
      isUserOnline.status === "unavailable" ||
      (!messageText.trim().length && !imageData)
    ) {
      return false
    };

    const msg: Message = {
      chatId: selectedChat!.chatId,
      messageId: v4(),
      senderId: currentUser!._id,
      recipientId: otherUserId,
      senderData: {
        _id: currentUser!._id,
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
    setOpenEmojiPicker(false);
  };


  /**
   * Seleccionar emoji
   */
  const onEmojiPickHandler = (emoji: any) => {
    setMessageText(prev => prev + emoji.native)
  };

  
  /**
   * Seleccionar una imagen
   */
  const onImagePickHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if(files) {
      const file = files[0];
      const imageBase64 = await imageResizer(file, "base64") as string;
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

  
  /**
   * Texto indicador de estado offline o unavailable
   */
  const StatusText = ({status}: {status: "offline" | "unavailable"}) => {
    let text = "";

    if (status === "offline") {
      text = "is offline"
    };

    if (status === "unavailable") {
      text = "is currently unavailable"
    };

    return (
      <motion.div
        className="absolute -top-5 left-0 w-full px-2 text-center text-sm uppercase z-10"
        initial={{translateY: "100%", opacity: 0}}
        animate={{translateY: "0", opacity: 1}}
        exit={{translateY: "100%", opacity: 0}}
      >
        <p className="text-red-600 text-ellipsis">
          {otherUserData.firstName} {text}
        </p>
      </motion.div>
    )
  };


  return (
    <div className="absolute right-2 bottom-0 z-[100]">
      {/* Seleccionador de emojis */}
      {openEmojiPicker &&
        <>
          <div
            className="fixed bottom-0 left-0 w-screen h-screen bg-transparent"
            onClick={() => setOpenEmojiPicker(false)}
          />
          <EmojiPicker pickEmojiHandler={onEmojiPickHandler}/>
        </>
      }

      {/* Contenido */}
      <div className="flex flex-col w-[330px] h-[450px] bg-slate-100 shadow-lg rounded-t-lg">
        {/* Header de la bandeja */}
        <div className="flex justify-between items-stretch w-full px-3 py-2 flex-shrink-0 border-b border-gray-400 bg-gray-300 rounded-t-lg">
          <div className="flex justify-start items-center gap-2">
            <div className="relative w-8 h-8">
              <img
                className="block w-full h-full object-cover object-center rounded-full border-2 border-gray-500"
                src={otherUserData.avatar}
                alt={otherUserData.firstName}
              />

              {/* Indicador de status online */}
              <div
                style={{
                  backgroundColor: isUserOnline && isUserOnline.status === "unavailable" ? "#ea580c" : isUserOnline ? "#16a34a" : "#9ca3af"
                }}
                className="absolute -bottom-[2px] right-[1px] w-[11px] h-[11px] rounded-full outline outline-2 outline-gray-100"
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
        <div className="w-full flex-grow p-3 scrollbar-thin scrollbar-thumb-gray-400 overflow-y-auto">
          <div className="flex flex-col justify-start gap-4">
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
        <div
          style={{
            pointerEvents: isUserOnline && isUserOnline.status === "available" ? "all" : "none",
            backgroundColor: isUserOnline && isUserOnline.status === "available" ? "white" : "#eee"
          }}
          className="flex flex-col w-full flex-shrink-0 border-t border-gray-400 bg-white transition-colors overflow-hidden"
        >
          <textarea
            className="block w-full min-h-[70px] mb-1 px-2 pt-1 flex-grow resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-500"
            placeholder="Type your message..."
            value={messageText}
            disabled={!isUserOnline || (isUserOnline && isUserOnline.status === "unavailable")}
            onChange={(e) => setMessageText(e.currentTarget.value)}
          />
          
          <div className="relative flex justify-end items-center gap-3 mt-1 pr-3 py-1 flex-shrink-0 border border-t border-gray-200">
            <Tooltip id="pick-emoji-button" />
            <Tooltip id="select-image-button" />
            <Tooltip id="send-message-button" />

            {/* Texto de estado offline */}
            <AnimatePresence>
              {!isUserOnline && <StatusText status="offline" />}
            </AnimatePresence>

            {/* Texto de estado unavailable */}
            <AnimatePresence>
              {isUserOnline && isUserOnline.status === "unavailable" &&
                <StatusText status="unavailable" />
              }
            </AnimatePresence>

            {/* Preview de la imagen seleccionada */}
            <AnimatePresence>
              {imageData && (
                <motion.div
                  className="relative ml-1 mr-auto p-[2px] rounded-md border border-gray-400"
                  initial={{width: 0, height: 0, opacity: 0}}
                  animate={{width: 60, height: 60, opacity: 1}}
                  exit={{width: 0, height: 0, opacity: 0}}
                >
                  <FaTimesCircle
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full fill-red-500 bg-white cursor-pointer"
                    onClick={() => setImageData(null)}
                  />
                  <img
                    className="block w-full h-full object-cover object-center rounded-md"
                    src={imageData}
                    alt={"Picked image"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input del selector de imágenes */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple={false}
              disabled={!isUserOnline || (isUserOnline && isUserOnline.status === "unavailable")}
              accept="image/png, image/jpg, image/jpeg"
              onChange={onImagePickHandler}
            />

            <BsEmojiSmile
              className="w-[27px] h-[27px] opacity-80 cursor-pointer"
              data-tooltip-id="pick-emoji-button"
              data-tooltip-content="Add emoji"
              onClick={() => setOpenEmojiPicker((prev) => !prev)}
            />
            <BsImage
              className="w-[27px] h-[27px] opacity-80 cursor-pointer"
              data-tooltip-id="select-image-button"
              data-tooltip-content={imageData ? "Change image" : "Add image"}
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
    </div>
  )
};

export default ChatWindow;