import { Dispatch, SetStateAction } from "react";
import { IconType } from "react-icons/lib";

interface Props {
  Icon: IconType;
  text: string;
  tabIndex: number;
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>
};

const TabItem = ({Icon, text, tabIndex, activeTab, setActiveTab}: Props) => {
  const isActiveTab = tabIndex === activeTab;

  return (
    <div
      style={{backgroundColor: isActiveTab ? "#e4e4e4" : "transparent"}}
      className="flex justify-start items-center gap-3 p-3 border-b border-gray-300 bg-transparent overflow-hidden cursor-pointer hover:bg-gray-300 transition-colors"
      onClick={() => setActiveTab(tabIndex)}
    >
      <Icon className="w-[30px] h-[30px] opacity-30" />
      <p className="hidden md:block text-left text-ellipsis">
        {text}
      </p>
    </div>
  )
};

export default TabItem;