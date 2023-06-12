import { Link } from "react-router-dom";
import { AiOutlineWechat, AiFillLock } from "react-icons/ai";
import { BiVideoPlus } from "react-icons/bi";
import Logo from "../components/Logo";
import withoutAuthentication from "../components/HOC/withoutAuthentication";

const LandingPage = () => {
  document.title = "GeoCall App";

  return (
    <section className="flex w-screen h-screen lg:pl-8 bg-gray-100">
      {/* Columna izquierda */}
      <header className="relative flex flex-col justify-between items-center gap-5 w-screen tablet:w-[55%] px-3 py-4 z-10 min-[350px]:px-6">
        <div className="flex flex-col justify-start items-start flex-grow gap-12">
          <nav className="flex justify-between items-center w-full">
            <Logo size="sm" />
            <ul className="hidden justify-end items-center flex-grow gap-4 xs:flex">
              <li className="block min-w-[120px]">
                <Link
                  to="/signup"
                  className="block w-full py-2 text-base text-center text-white font-bold uppercase border-2 border-orange-600 bg-orange-600 rounded-full tracking-[1px] hover:bg-orange-900 transition-colors"
                >
                  Signup
                </Link>
              </li>
              <li className="block min-w-[120px]">
                <Link
                  to="/login"
                  className="block w-full py-2 text-base text-center font-bold text-gray-800 uppercase border-2 border-orange-600 bg-white rounded-full hover:bg-orange-50 transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </nav>

          <div className="my-auto">
            <p className="mb-2 text-4xl sm:text-5xl text-left font-bold leading-none text-gray-800">
              Connect with anyone, anywhere in the world!
            </p>
            <p className="mb-4 text-lg font-normal text-black xs:mb-8 xs:text-xl tablet:text-gray-800">
              Connect with people from all over the world and experience new cultures, languages and ideas. Meet new people and stay in touch with friends and family, no matter where they are.
            </p>
            
            <div className="flex flex-col justify-start items-center gap-3 w-full xs:hidden">
              <Link
                to="/signup"
                className="w-full py-3 text-base text-center text-white font-bold uppercase bg-orange-600 rounded-full tracking-[1px] hover:bg-orange-900 transition-colors xs:w-[180px]"
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="w-full py-3 text-base text-center font-bold text-gray-800 uppercase border-2 border-orange-600 bg-white rounded-full hover:bg-orange-50 transition-colors xs:w-[180px]"
              >
                Login
              </Link>
            </div>
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
              Messages are not stored in any server. Only you can read them as they are stored only on your browser.
            </p>
          </div>
        </div>
      </header>

      {/* Columna derecha */}
      <div
        style={{backgroundImage: "url(/img/connected-world.webp)"}}
        className="absolute tablet:static w-screen tablet:w-[45%] flex-shrink-[2] bg-left bg-cover bg-no-repeat top-0 left-0 h-screen opacity-25 tablet:opacity-100 z-0"
      />
    </section>
  )
};

export default withoutAuthentication(LandingPage);