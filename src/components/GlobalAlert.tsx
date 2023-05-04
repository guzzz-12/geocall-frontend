import { useSelector } from "react-redux";
import { AnimatePresence, motion} from "framer-motion";
import { GlobalAlertRootState } from "../redux/store";

const GlobalAlert = () => {
  const {isOpen, message} = useSelector((state: GlobalAlertRootState) => state.globalAlert);

  return (
    <AnimatePresence>
      {isOpen && message &&
        <motion.div
          className="fixed bottom-4 left-[50%] flex justify-center items-center min-w-[200px] max-w-[400px] px-3 py-2 -translate-x-[50%] bg-red-50 border-2 border-red-700 rounded-md"
          initial={{y: "100%", opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: "130%", opacity: 0}}
        >
          <p
            className="text-center text-gray-700 font-normal"
            dangerouslySetInnerHTML={{__html: message}}
          />
        </motion.div>
      }
    </AnimatePresence>
  )
};

export default GlobalAlert;