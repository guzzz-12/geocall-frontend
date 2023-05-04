import { Dispatch, SetStateAction } from "react";
import { GrClose } from "react-icons/gr";
import Logo from "./Logo";

interface Props {
  setIsOpen: Dispatch<SetStateAction<boolean>>
};


/**
 * Modal para explicarle al usuario las limitaciones actuales
 * de la aplicación impuestas por el hosting gratuito.
 */
const InfoBanner = ({setIsOpen}: Props) => {
  const onCloseHandler = () => {
    localStorage.setItem("showInfoModal", "false");
    setIsOpen(false);
  };

  return (
    <section className="fixed top-0 left-0 flex justify-center items-center w-screen h-screen bg-[rgba(0,0,0,0.8)] z-[1000]">
      <div className="relative flex flex-col justify-start items-center min-w-[320px] max-w-[500px] min-h-[200px] p-5 rounded-xl bg-white">
        <div
          className="absolute top-2 right-2 p-1 bg-transparent hover:bg-gray-300 transition-colors cursor-pointer"
          onClick={onCloseHandler}
        >
          <GrClose className="w-5 h-5 text-gray-800" />
        </div>

        <Logo size="md" />

        <h1 className="mt-8 mb-3 text-xl text-center font-bold">
          Welcome to GeoCall App
        </h1>

        <div className="flex flex-col gap-2 mb-8">
          <p className="text-base">
            The application is currently running in test mode and even when it's fully functional, due to limitations imposed by the free hosting service the realtime connection is restarted approximately every 5 minutes, which affects the chat and videocalls functionality. Active videocalls should not be affected tho.
          </p>
          <p className="font-bold">
            When this event arises we will notify you so that you refresh the page and go back inline again.
          </p>
        </div>

        <button
          className="auth-btn w-[100px]"
          onClick={onCloseHandler}
        >
          Accept
        </button>
      </div>
    </section>
  )
};

export default InfoBanner;