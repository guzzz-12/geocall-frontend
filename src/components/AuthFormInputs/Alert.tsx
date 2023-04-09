import { motion } from "framer-motion";
import { AiFillCheckCircle } from "react-icons/ai";
import { RiErrorWarningFill } from "react-icons/ri";

interface Props {
  type: "success" | "error";
  message: string;
};

const Alert = ({type, message}: Props) => {
  return (
    <motion.div
      className={`flex justify-start items-center gap-2 w-full p-3 rounded-md border ${type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50" }`}
      initial={{translateY: -15, opacity: 0}}
      animate={{translateY: 0, opacity: 1}}
      exit={{translateY: -15, opacity: 0}}
    >
      {type === "success" && <AiFillCheckCircle className="text-xl text-green-500" />}
      {type === "error" && <RiErrorWarningFill className="w-[30px] h-[30px] shrink-0 text-red-700" />}
      <span className="text-sm">
        {message}
      </span>
    </motion.div>
  )
};

export default Alert;