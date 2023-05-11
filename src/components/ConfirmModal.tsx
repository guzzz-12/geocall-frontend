import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  confirmActionBtnText: string;
  cancelActionBtnText: string;
  confirmAction: () => Promise<void>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const ConfirmModal = (props: Props) => {
  return (
    <motion.div
      key="modal-wrapper"
      className="fixed top-0 left-0 flex justify-center items-center w-full h-full bg-[rgba(0,0,0,0.75)] z-[1000]"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      onClick={() => props.setIsOpen(false)}
    >
      <motion.div
        key="modal-content"
        className="flex flex-col justify-start items-center w-[350px] h-[150px] p-3 bg-white rounded-lg"
        initial={{y: -10}}
        animate={{y: 0}}
        exit={{y: -10}}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-xl text-center text-gray-700">
          {props.title}
        </p>
        <div className="flex justify-between items-center gap-2 w-full my-auto">
          <button
            className="basis-full flex-grow auth-btn text-sm text-red-700 bg-red-50"
            onClick={async () => {
              await props.confirmAction();
              props.setIsOpen(false);
            }}
          >
            {props.confirmActionBtnText}
          </button>

          <button
            className="basis-full flex-grow auth-btn text-sm"
            onClick={() => props.setIsOpen(false)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
};

export default ConfirmModal;