import { Link } from "react-router-dom";
import { AiOutlineWechat, AiFillLock } from "react-icons/ai";
import { BiVideoPlus } from "react-icons/bi";
import Logo from "../components/Logo";
import withoutAuthentication from "../components/HOC/withoutAuthentication";

const LandingPage = () => {
  document.title = "GeoCall App";

  return (
    <section className="flex w-screen h-screen bg-gray-100">
      {/* Columna izquierda */}
      <header className="relative flex flex-col justify-between items-center w-[55%] px-6 py-4 z-10 max-[850px]:w-screen">
        <div className="self-start">
          <Logo size="sm" />
        </div>

        <div className="flex flex-col justify-center items-start">
          <p className="mb-2 text-5xl text-left font-bold leading-none text-gray-800">
            Connect with anyone, anytime, anywhere in the world!
          </p>
          <p className="mb-8 text-xl font-normal text-gray-800">
            Connect with people from all over the world and experience new cultures, languages and ideas. Meet new people and stay in touch with friends and family, no matter where they are.
          </p>

          <div className="flex justify-center items-center gap-3">
            <Link
              to="/signup"
              className="w-[180px] py-3 text-base text-center text-white font-bold uppercase bg-orange-600 rounded-full tracking-[1px] hover:bg-orange-900 transition-colors"
            >
              Signup
            </Link>
            <Link
              to="/login"
              className="w-[180px] py-3 text-base text-center font-bold text-gray-800 uppercase border-2 border-orange-600 bg-white rounded-full hover:bg-orange-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-start gap-5 w-full mb-4">
          <div className="flex flex-col justify-start items-center gap-1 w-[33%] text-center">
            <AiOutlineWechat className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Send text and images instantly with our realtime chat focused on your privacy.
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1 w-[33%] text-center">
            <BiVideoPlus className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Take the conversation to the next level making videocalls with anyone anytime.
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1 w-[33%] text-center">
            <AiFillLock className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Messages are not stored in any server. Only you can read them as they are stored only on your device.
            </p>
          </div>
        </div>
      </header>

      {/* Columna derecha */}
      <div
        style={{backgroundImage: "url(/img/connected-world.png)"}}
        className="w-[45%] flex-shrink-[2] bg-left bg-cover bg-no-repeat max-[850px]:absolute max-[850px]:top-0 max-[850px]:left-0 max-[850px]:w-screen max-[850px]:h-screen max-[850px]:bg-cover max-[850px]:opacity-25 max-[850px]:z-0"
      />
    </section>
  )
};

export default withoutAuthentication(LandingPage);