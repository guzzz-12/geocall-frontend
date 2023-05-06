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
  setOpenDrawer?: Dispatch<SetStateAction<boolean>>
};

const ChatsList = ({isOpen, chatUsersData, isLoading, isError, setIsOpen, setOpenDrawer}: Props) => {
  const {chats} = useSelector((state: ChatsRootState) => state.chats);

  if (!isOpen) {
    return null;
  };

  return (
    <div className="absolute -bottom-4 xs:bottom-0 right-0 w-full max-w-[250px] max-h-[300px] bg-gray-50 border-t border-gray-300 translate-y-[100%] rounded-b-md shadow-md scrollbar-thin scrollbar-thumb-slate-500 overflow-x-hidden overflow-y-auto z-50">
      <ul
        className="flex flex-col justify-stretch items-start w-full min-h-[60px]"
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
              setOpenDrawer={setOpenDrawer}
            />
          )
        })}
      </ul>
    </div>
  )
};

export default ChatsList;