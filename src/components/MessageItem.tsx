import { useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { Twemoji } from "react-emoji-render";
import dayjs from "dayjs";
import { BiFullscreen } from "react-icons/bi";
import { Message } from "../redux/features/chatsSlice";
import { User } from "../redux/api";
import { openImageModal } from "../redux/features/imageModalSlice";

interface Props {
  message: Message;
  currentUser: User;
};


const MessageItem = ({message, currentUser}: Props) => {
  const isSender = message.senderId === currentUser._id;

  const dispatch = useDispatch();

  return (
    <div
      style={{ marginLeft: isSender ? "auto" : 0}}
      className="relative w-[max-content] max-w-[85%]"
    >
      <Tooltip
        style={{color: "black", background: "#f8fafc", zIndex: 100}}
        id="image-attachement-tooltip"
      />

      {message.content.length > 0 &&
        <div
          style={{backgroundColor: isSender ? "#bae6fd" : "#d1d5db"}}
          className="w-full px-4 py-2 text-left text-sm whitespace-pre-line leading-normal rounded-lg shadow-md"
        >
          <Twemoji className="msg-body">
            {message.content}
          </Twemoji>
        </div>
      }

      {message.attachment &&
        <div
          className="relative"
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
            className="w-full mt-2 px-4 py-2 text-left text-sm leading-normal rounded-lg shadow-md"
            src={message.attachment}
            alt="Attachement"
          />
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