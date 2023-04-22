import { useSelector, useDispatch } from "react-redux";
import { TfiClose } from "react-icons/tfi";
import { ImageModalRootState } from "../redux/store";
import { closeImageModal } from "../redux/features/imageModalSlice";

const ImageModal = () => {
  const dispatch = useDispatch();
  const {image, isOpen} = useSelector((state: ImageModalRootState) => state.imageModal);

  if (!isOpen || !image) {
    return null;
  };

  return (
    <div
      className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.85)] z-[1000]"
      onClick={() => dispatch(closeImageModal())}
    >
      <TfiClose className="absolute top-2 left-2 w-9 h-9 fill-white z-50 cursor-pointer" />
      <div
        className="flex justify-center items-end h-[98%] aspect-[4/3] p-2 rounded-md bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <img className="block w-auto h-full object-contain object-center" src={image} alt="File attachment" />
      </div>
    </div>
  )
};

export default ImageModal;