import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import ChatItem from "./ChatItem";
import { ChatsRootState } from "../../redux/store";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ChatsList = ({isOpen, setIsOpen}: Props) => {
  const {chats} = useSelector((state: ChatsRootState) => state.chats);

  if (!isOpen) {
    return null;
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-transparent z-1000"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="absolute flex flex-col -bottom-2 -right-3 justify-stretch items-start w-[250px] min-h-min max-h-[300px] translate-y-[100%] bg-white rounded-b-md border border-gray-400 scrollbar-thin scrollbar-thumb-slate-500 overflow-y-auto z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {chats.length === 0 && (
          <div className="flex justify-center items-center self-center w-full p-3">
            <p className="flex-grow text-center">
              You have no chats yet!
            </p>
          </div>
        )}
        {chats.map(chat => {
          return (
            <ChatItem key={chat.chatId} chat={chat} />
          )
        })}
      </div>
    </>
  )
};

export default ChatsList;