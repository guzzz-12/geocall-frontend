import { useSelector } from "react-redux";
import { AnimatePresence, motion} from "framer-motion";
import { GlobalAlertRootState, UserRootState } from "../redux/store";

const GlobalAlert = () => {
  const {isAuth} = useSelector((state: UserRootState) => state.user);
  const {isOpen, message} = useSelector((state: GlobalAlertRootState) => state.globalAlert);

  if (!isAuth) {
    return null
  };

  return (
    <AnimatePresence>
      {isOpen && message &&
        <motion.div
          className="fixed bottom-2 left-[50%] flex justify-center items-center min-w-[200px] max-w-[400px] px-3 py-2 bg-red-50 border-2 border-red-700 rounded-md"
          initial={{x: "-50%", y: "100%", z: 0, opacity: 0}}
          animate={{x: "-50%", y: 0, z: 0, opacity: 1}}
          exit={{x: "-50%", y: "130%", z: 0, opacity: 0}}
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