import { Link } from "react-router-dom";
import { AiOutlineWechat, AiFillLock } from "react-icons/ai";
import { BiVideoPlus } from "react-icons/bi";
import withoutAuthentication from "../components/HOC/withoutAuthentication";

const LandingPage = () => {
  document.title = "GeoCall App";

  return (
    <section className="flex w-screen h-screen bg-gray-100">
      <header className="relative flex flex-col justify-between items-center w-[55%] px-6 py-4 z-10 max-[850px]:w-screen">
        <Link to="/" className="flex justify-between items-center gap-1 self-start">
          <img
            className="block w-11 h-11"
            src="/world-map.png"
            alt="World map icon"
          />
          <h1 className="text-lg font-bold text-gray-600">
            Geo<span className="text-orange-600">Call</span>
          </h1>
        </Link>

        <div className="flex flex-col justify-center items-start">
          <p className="mb-8 text-4xl font-bold leading-[42px] text-gray-800">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate nemo, accusantium dolore ducimus quod
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

        <div className="flex justify-between items-start gap-5 w-full">
          <div className="flex flex-col justify-start items-center gap-1 text-center">
            <AiOutlineWechat className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quam nesciunt saepe adipisci rem officiis veniam.
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1 text-center">
            <BiVideoPlus className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae illum sit ad. Maxime, maiores.
            </p>
          </div>
          <div className="flex flex-col justify-center items-center gap-1 text-center">
            <AiFillLock className="w-[50px] h-[50px] fill-gray-600" />
            <p className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut enim quo assumenda quasi tempore soluta!
            </p>
          </div>
        </div>
      </header>

      <div
        style={{backgroundImage: "url(/img/connected-world.png)"}}
        className="w-[45%] flex-shrink-[2] bg-left bg-cover bg-no-repeat max-[850px]:absolute max-[850px]:top-0 max-[850px]:left-0 max-[850px]:w-screen max-[850px]:h-screen max-[850px]:bg-cover max-[850px]:opacity-25 max-[850px]:z-0"
      />
    </section>
  )
};

export default withoutAuthentication(LandingPage);