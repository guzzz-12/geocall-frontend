import { Dispatch, SetStateAction } from "react";
import { useSelector } from "react-redux";
import ChatItem from "./ChatItem";
import ChatItemSkeleton from "./ChatItemSkeleton";
import { ChatsRootState } from "../../redux/store";
import { ChatMember } from "../../redux/features/chatsSlice";

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  isError: boolean;
  chatUsersData: ChatMember[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ChatsList = ({isOpen, chatUsersData, isLoading, isError, setIsOpen}: Props) => {
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
        className="absolute flex flex-col -bottom-2 -right-3 justify-stretch items-start w-[250px] min-h-min max-h-[300px] translate-y-[100%] bg-white rounded-b-md scrollbar-thin scrollbar-thumb-slate-500 overflow-y-auto z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading &&
          <>
            <ChatItemSkeleton />
            <ChatItemSkeleton />
            <ChatItemSkeleton />
          </>
        }

        {isError &&
          <div className="flex justify-center items-center self-center w-full p-3">
            <p className="flex-grow text-center">
              Error loading chats.
            </p>
          </div>
        }

        {!isLoading && chats.length === 0 && (
          <div className="flex justify-center items-center self-center w-full p-3">
            <p className="flex-grow text-center">
              You have no chats yet!
            </p>
          </div>
        )}

        {chatUsersData.map((member) => {
          return (
            <ChatItem
              key={member._id}
              chatMember={member}
              setIsOpen={setIsOpen}
            />
          )
        })}
      </div>
    </>
  )
};

export default ChatsList;