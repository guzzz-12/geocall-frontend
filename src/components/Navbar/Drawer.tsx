import { Dispatch, SetStateAction, memo } from "react";
import { GrClose } from "react-icons/gr";
import Logo from "../Logo";
import NavItems from "./NavItems";
import { User } from "../../redux/api";
import { ChatMember } from "../../redux/features/chatsSlice";
import { Notification } from "../../redux/features/notificationsSlice";
import { UserAvailability } from "../../redux/features/mapSlice";
import ChatsList from "../ChatsList";

interface Props {
  currentUser: User;
  chatUsersData: ChatMember[];
  isLoading: boolean;
  isNotificationsOpen: boolean;
  unread: Notification[];
  chatStatus: UserAvailability;
  isError: boolean;
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  setIsNotificationsOpen: Dispatch<SetStateAction<boolean>>;
  onClickNotificationsHandler: () => Promise<false | undefined>;
  availabilityChangeHandler: () => void;
  logoutHandler: () => void;
}

const Drawer = (props: Props) => {
  return (
    <nav
      className="flex flex-col justify-start items-center gap-3 w-[250px] h-full py-3 bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <GrClose
        className="absolute top-1 right-1 w-4 h-4 cursor-pointer"
        onClick={() => props.setOpenDrawer(false)}
      />

      <div className="mt-1">
        <Logo size="sm" />
      </div>

      <div className="w-full h-[1px] mb-2 bg-gray-300"/>

      <div
        className="relative w-full px-3"
        onClick={(e) => e.stopPropagation()}
      >
        <ChatsList
          isOpen={props.isNotificationsOpen}
          isLoading={props.isLoading}
          isError={props.isError}
          chatUsersData={props.chatUsersData}
          setIsOpen={props.setIsNotificationsOpen}
          setOpenDrawer={props.setOpenDrawer}
        />
        <NavItems {...props} />
      </div>
    </nav>
  )
};

export default memo(Drawer);