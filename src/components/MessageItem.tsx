import dayjs from "dayjs";
import { Message } from "../redux/features/chatsSlice";
import { User } from "../redux/api";

interface Props {
  message: Message;
  sender: User;
  currentUser: User;
};


const MessageItem = ({message, sender, currentUser}: Props) => {
  const isSender = message.senderId === currentUser._id;

  return (
    <div
      style={{ marginLeft: isSender ? "auto" : 0}}
      className="w-[max-content] max-w-[85%]"
    >
      <p
        style={{backgroundColor: isSender ? "#bae6fd" : "#d1d5db"}}
        className="w-full px-4 py-2 text-left text-base leading-normal rounded-lg shadow-md"
      >
        {message.content}
      </p>
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