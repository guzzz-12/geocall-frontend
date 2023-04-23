import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TfiClose, TfiZoomIn, TfiZoomOut } from "react-icons/tfi";
import { BsArrowsAngleContract } from "react-icons/bs";
import { ImageModalRootState } from "../redux/store";
import { closeImageModal } from "../redux/features/imageModalSlice";

const ImageModal = () => {
  const dispatch = useDispatch();
  const {image, isOpen} = useSelector((state: ImageModalRootState) => state.imageModal);

  const [zoomLevel, setZoomLevel] = useState<number>(0);

  /**
   * Aumentar/disminuir/restaurar el nivel de zoom de la imagen
   */
  const onZoomClickHandler = (type: "more" | "less" | "restore") => {
    setZoomLevel(prev => {
      if (type === "more") {
        return prev + 1
      };

      if (type === "less") {
        return prev - 1;
      };

      if (type === "restore") {
        return 0;
      };

      return 0;
    })
  };

  if (!isOpen || !image) {
    return null;
  };

  return (
    <div
      className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.85)] z-[1000]"
      onClick={() => {
        setZoomLevel(0);
        dispatch(closeImageModal());
      }}
    >
      <div className="absolute top-3 left-3 flex flex-col gap-5 p-2 bg-black rounded z-50">
        <TfiClose className="w-8 h-8 fill-white cursor-pointer"/>

        {/* Botón para aumentar el zoom de la imagen */}
        {(zoomLevel >= 0 && zoomLevel <= 2) && (
          <TfiZoomIn
            className="w-8 h-8 fill-white cursor-pointer"
            onClick={(e) => {
              onZoomClickHandler("more");
              e.stopPropagation();
            }}
          />
        )}

        {/* Botón para disminuir el nivel de zoom de la imagen */}
        {(zoomLevel >= 1 && zoomLevel < 3) && (
          <TfiZoomOut
            className="w-8 h-8 fill-white cursor-pointer"
            onClick={(e) => {
              onZoomClickHandler("less");
              e.stopPropagation();
            }}
          />
        )}

        {/* Botón para restaurar el zoom de la imagen */}
        {(zoomLevel === 3) && (
          <BsArrowsAngleContract
            className="w-8 h-8 fill-white cursor-pointer"
            onClick={(e) => {
              onZoomClickHandler("restore");
              e.stopPropagation();
            }}
          />
        )}
      </div>

      <div
        className="flex justify-center items-end h-[98%] aspect-[4/3] p-2 rounded-md bg-gray-900 overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-white select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          style={{transform: `scale(${1 + zoomLevel * 0.5})`}}
          className="block w-full h-full object-contain object-center origin-top-left transition-transform"
          src={image}
          alt="File attachment"
        />
      </div>
    </div>
  )
};

export default ImageModal;