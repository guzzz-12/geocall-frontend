import { AiFillCheckCircle, AiOutlineClose } from "react-icons/ai";
import { RiErrorWarningFill } from "react-icons/ri";

interface Props {
  type: "success" | "error";
  message: string;
  dismissAlert?: () => void;
};

const Alert = ({type, message, dismissAlert}: Props) => {
  return (
    <div
      className={`relative flex justify-start items-center gap-2 w-full p-3 rounded-md border ${type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
    >
      {type === "success" && <AiFillCheckCircle className="text-xl text-green-500" />}
      {type === "error" && <RiErrorWarningFill className="w-[30px] h-[30px] shrink-0 text-red-700" />}
      <span className="text-sm">
        {message}
      </span>
      {dismissAlert && (
        <AiOutlineClose
          className="w-[30px] h-[30px] ml-auto p-2 cursor-pointer"
          onClick={dismissAlert}
        />
      )}
    </div>
  )
};

export default Alert;