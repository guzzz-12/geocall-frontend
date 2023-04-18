import { IconType } from "react-icons/lib";
import { Tooltip } from "react-tooltip";

interface Props {
  Icon: IconType;
  title?: string;
  disabled: boolean;
  tooltipText: string;
  onClickHandler: () => void;
};

const IconButton = ({Icon, title, disabled, tooltipText, onClickHandler}: Props) => {
  return (
    <>
      <Tooltip id="button-tooltip" positionStrategy="fixed" style={{maxWidth: 240}} />
      <span
        className="w-full"
        data-tooltip-id="button-tooltip"
        data-tooltip-content={tooltipText}
      >
        <button
          className="flex justify-center items-center gap-2 w-full px-3 py-1 rounded bg-blue-700 text-white hover:bg-blue-900 transition-colors disabled:bg-gray-500 disabled:hover:bg-gray-500  disabled:cursor-default"
          disabled={disabled}
          onClick={onClickHandler}
        >
          <Icon className="block w-5 h-5" />
          {title}
        </button>
      </span>
    </>
  )
};

export default IconButton;