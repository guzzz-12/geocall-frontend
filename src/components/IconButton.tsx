import { IconType } from "react-icons/lib";
import { Tooltip } from "react-tooltip";

interface Props {
  Icon: IconType;
  title?: string;
  tooltipText: string;
  onClickHandler: () => void;
};

const IconButton = ({Icon, title, tooltipText, onClickHandler}: Props) => {
  return (
    <>
      <Tooltip id="button-tooltip" />
      <button
        className="flex justify-between items-center gap-2 px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900 transition-colors"
        data-tooltip-id="button-tooltip"
        data-tooltip-content={tooltipText}
        onClick={onClickHandler}
      >
        <Icon className="block w-5 h-5" />
        {title}
      </button>
    </>
  )
};

export default IconButton;