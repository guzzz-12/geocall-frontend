import { useState, useEffect, useRef, useContext, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { v4 } from "uuid";
import { GrClose } from "react-icons/gr";
import { FiSend } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { BsImage, BsEmojiSmile } from "react-icons/bs";
import { BiVideoPlus } from "react-icons/bi";

import MessageItem from "./MessageItem";
import EmojiPicker from "./EmojiPicker";
import IconButton from "./IconButton";
import { VideocallContext } from "../hooks/VideoCallContext";
import { ChatsRootState, MapRootState, UserRootState } from "../redux/store";
import { Message, closeChat, createMessage, deleteMessage } from "../redux/features/chatsSlice";
import { Notification } from "../redux/features/notificationsSlice";
import { SocketEvents, socketClient } from "../socket/socketClient";
import { imageProcessor } from "../utils/imageCompression";
import { setSelectedUserPrefetch } from "../redux/features/mapSlice";

export interface DeleteMessageModalState {
  open: boolean;
  msgId: string | null;
  isSender: boolean;
};

const ChatWindow = () => {
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {videoCallHandler, selectedUser} = useContext(VideocallContext);

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);
  const {selectedChat} = useSelector((state: ChatsRootState) => state.chats);
  const {onlineUsers} = useSelector((state: MapRootState) => state.map);

  const [messageText, setMessageText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [deleteMessageModal, setDeleteMessageModal] = useState<DeleteMessageModalState>({
    open: false,
    msgId: null,
    isSender: false
  });

  // Extraer la ID del otro usuario de la conversación
  const otherUserId = selectedChat?.senderId === currentUser?._id ? selectedChat?.recipientId : selectedChat?.senderId;

  // Extraer la id y la data del otro usuario de la conversación
  const otherUserData = selectedChat?.recipientId === currentUser?._id ? selectedChat?.senderData : selectedChat?.recipientData;

  // Verificar si el usuario está online
  const isUserOnline = onlineUsers.find(user => user.userId === otherUserId);


  /*---------------------------------------------*/
  // Escuchar evento de escribiendo
  // Iniciar la consulta de la data del usuario
  /*---------------------------------------------*/
  useEffect(() => {
    if (otherUserId) {
      socketClient.socket.on(SocketEvents.TYPING, (data: {senderId: string, typing: boolean}) => {
        // En el caso de que hubieran múltiples ventanas abiertas
        // evitar mostrar el tiping en las demás ventanas
        if (data.senderId === otherUserId) {
          setIsTyping(data.typing)
        }
      })
    };

    return () => {
      socketClient.socket.off(SocketEvents.TYPING)
    };
  }, [otherUserId]);


  /*--------------------------------------------------------------*/
  // Emitir evento de escribiendo en true cada vez que tipea
  // y emitirlo en false si deja de tipear durante 600ms
  /*--------------------------------------------------------------*/
  useEffect(() => {
    let timeoutId: number | null = null;

    socketClient.socket.emit(SocketEvents.TYPING, {
      senderId: currentUser?._id,
      recipientId: otherUserId,
      typing: true
    });

    timeoutId = setTimeout(() => {
      socketClient.socket.emit(SocketEvents.TYPING, {
        senderId: currentUser?._id,
        recipientId: otherUserId,
        typing: false
      })
    }, 600);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    };
  }, [messageText, otherUserId, currentUser]);


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
   * Enviar el mensaje.
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
      deleted: false,
      createdAt: new Date().toISOString()
    };

    const notification: Notification = {
      notificationId: v4(),
      notificationType: "incomingMessage",
      receiverId: otherUserId,
      senderId: currentUser!._id,
      senderData: {
        _id: currentUser!._id,
        firstName: currentUser!.firstName,
        lastName: currentUser!.lastName,
        avatar: currentUser!.avatar,
      },
      recipientData: otherUserData,
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
   * Seleccionar emoji.
   */
  const onEmojiPickHandler = (emoji: any) => {
    setMessageText(prev => prev + emoji.native)
  };

  
  /**
   * Seleccionar una imagen.
   */
  const onImagePickHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if(files) {
      const file = files[0];
      const imageBase64 = await imageProcessor(file, "base64") as string;
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
   * Texto indicador de estado offline o unavailable.
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


  /**
   * Pasar la ID del usuario del chat al state global
   * para abrir el card y consultar su perfil
   */
  const onUserNameClickHandler = () => {
    if (!isUserOnline || currentUser._id === isUserOnline.userId) {
      return false;
    };

    dispatch(setSelectedUserPrefetch({
      selectedUserId: isUserOnline.userId
    }));
  };


  /**
   * Eliminar un mensaje para el usuario o para todos los usuarios.
   */
  const deleteMessageHandler = async (mode: "me" | "all") => {
    const {msgId, isSender} = deleteMessageModal;

    dispatch(deleteMessage({chatId: selectedChat.chatId, messageId: msgId!}));
    
    // Si se selecciona la opción de borrar para todos,
    // eliminar en el usuario remoto si está conectado
    // y si es el remitente del mensaje.
    if (mode === "all" && isUserOnline && isSender) {
      socketClient.deletedMessage(otherUserId!, selectedChat.chatId, msgId!);
    };

    setDeleteMessageModal({open: false, msgId: null, isSender: false});
  };


  return (
    <>
      <AnimatePresence>
        {deleteMessageModal.open &&
          <motion.div
            key="modal-wrapper"
            className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.75)] z-[1000]"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <motion.div
              key="modal-content"
              className="flex flex-col justify-start items-center w-[350px] h-[150px] p-3 bg-white rounded-lg"
              initial={{y: -10}}
              animate={{y: 0}}
              exit={{y: -10}}
            >
              <p className="font-bold text-xl text-center text-gray-700">
                Delete message
              </p>
              <div className="flex justify-between items-center gap-2 w-full my-auto">
                <Tooltip id="delete-for-me" />
                <Tooltip id="delete-for-both" />

                <button
                  className="basis-full flex-grow auth-btn text-sm"
                  data-tooltip-id="delete-for-me"
                  data-tooltip-content="Delete for me only"
                  onClick={() => deleteMessageHandler("me")}
                >
                  For me
                </button>

                {/* Mostrar el botón de eliminar para ambos sólo si es el remitente del mensaje */}
                {deleteMessageModal.isSender &&
                  <span
                    data-tooltip-id="delete-for-both"
                    data-tooltip-content={isUserOnline ? "Delete for both users" : "The user is offline"}
                  >
                    <button
                      className="basis-full flex-grow auth-btn text-sm"
                      disabled={!isUserOnline}
                      onClick={() => deleteMessageHandler("all")}
                    >
                      For both
                    </button>
                  </span>
                }

                <button
                  className="basis-full flex-grow auth-btn text-sm text-red-700 bg-red-50"
                  onClick={() => {
                    setDeleteMessageModal({
                      open: false,
                      msgId: null,
                      isSender: false
                    })
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

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
          <div className="flex justify-between items-center w-full px-3 py-2 flex-shrink-0 border-b border-gray-400 bg-gray-300 rounded-t-lg">
            <div className="flex justify-start items-stretch gap-2 w-full">
              {/* Avatar del usuario remoto */}
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

              {/* Nombre del usuario remoto */}
              <div
                className="flex flex-col justify-start items-start cursor-pointer"
                onClick={onUserNameClickHandler}
              >
                <p className="-mb-1 font-semibold text-lg">
                  {otherUserData.firstName} {otherUserData.lastName}
                </p>
                {/* Indicador de escribiendo */}
                {isTyping &&
                  <p className="w-full text-left text-xs italic text-gray-700">
                    {otherUserData.firstName} is typing...
                  </p>
                }
              </div>

              {/* Botón para iniciar una videollamada */}
              <div className="w-min ml-auto self-center mr-2">
                <IconButton
                  Icon={BiVideoPlus}
                  disabled={false}
                  tooltipText={`Start a videocall with ${selectedUser?.firstName}`}
                  onClickHandler={videoCallHandler}
                />
              </div>
            </div>

            <div className="flex justify-center items-center cursor-pointer">
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
                    openDeleteModal={setDeleteMessageModal}
                  />
                )
              })}
            </div>

            {/* Elemento vacío para referencia del scroll to bottom */}
            <div className="mb-2" ref={chatBottomRef}/>
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
    </>
  )
};

export default ChatWindow;