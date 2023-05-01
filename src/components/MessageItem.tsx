import { Dispatch, SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { Twemoji } from "react-emoji-render";
import dayjs from "dayjs";
import { BiFullscreen } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Message } from "../redux/features/chatsSlice";
import { User } from "../redux/api";
import { openImageModal } from "../redux/features/imageModalSlice";
import { DeleteMessageModalState } from "./ChatWindow";

interface Props {
  message: Message;
  currentUser: User;
  openDeleteModal: Dispatch<SetStateAction<DeleteMessageModalState>>;
};


const MessageItem = ({message, currentUser, openDeleteModal}: Props) => {
  const dispatch = useDispatch();
  
  const isSender = message.senderId === currentUser._id;

  return (
    <div
      style={{ marginLeft: isSender ? "auto" : 0}}
      className="relative w-[max-content] max-w-[85%]"
    >
      <Tooltip
        style={{color: "black", background: "#f8fafc", zIndex: 100}}
        id="image-attachement-tooltip"
      />

      {/* Botón para eliminar el mensaje */}
      <button
        style={{
          display: !message.deleted ? "flex" : "none",
          right: isSender ? "unset" : -22,
          left: isSender ? -22 : "unset",
        }}
        className="absolute w-[20px] h-[20px] justify-center items-center text-gray-700 rounded-full cursor-pointer transition-colors hover:bg-gray-200"
        onClick={() => {
          openDeleteModal({open: true, msgId: message.messageId, isSender})
        }}
      >
        <BsThreeDotsVertical className="w-[16px] h-[16px]"/>
      </button>

      {(message.content.length > 0 || message.attachment) &&
        <div
          style={{
            fontStyle: message.deleted ? "italic" : "normal",
            backgroundColor: (isSender && !message.deleted) ? "#bae6fd" : "#d1d5db"
          }}
          className="w-full px-4 py-2 text-left text-sm whitespace-pre-line leading-normal rounded-lg shadow-md"
        >
          {message.content.length > 0 &&
            <Twemoji className="msg-body">
              {message.content}
            </Twemoji>
          }

          {message.attachment &&
            <div
              style={{marginTop: message.content.length > 0 ? 14 : "none"}}
              className="relative mb-1 shadow-md"
              data-tooltip-id="image-attachement-tooltip"
              data-tooltip-content="View full screen"
              data-tooltip-float={true}
              onClick={() => dispatch(openImageModal(message.attachment!))}
            >
              <div
                className="absolute top-0 left-0 flex flex-col justify-center items-center w-full h-full opacity-0 rounded-lg hover:bg-[rgba(0,0,0,0.55)] hover:opacity-100 transition-all cursor-pointer"
              >
                <BiFullscreen className="w-10 h-10 fill-white" />
              </div>
              <img
                style={{backgroundColor: isSender ? "#bae6fd" : "#d1d5db"}}
                className="w-full text-left text-sm leading-normal rounded-lg shadow-md"
                src={message.attachment}
                alt="Attachement"
              />
            </div>
          }
        </div>
      }

      <p
        style={{textAlign: isSender ? "right" : "left"}}
        className="w-full mt-1 px-4 text-sm text-gray-400"
        title={dayjs(message.createdAt).format("MM/DD/YYYY HH:mm:ss")}
      >
        {dayjs(message.createdAt).format("MM/DD/YY")}
      </p>
    </div>
  )
};

export default MessageItem;