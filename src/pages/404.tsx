import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { TfiFaceSad } from "react-icons/tfi";
import Navbar from "../components/Navbar";
import { RootState } from "../redux/store";

const NotFoundPage = () => {
  document.title = "GeoCall | Page Not Found";

  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  return (
    <section className="flex flex-col justify-start h-[100dvh] overflow-hidden">
      {currentUser &&
        <div className="flex-shrink-0">
          <Navbar navbarType="static" />
        </div>
      }

      <div className="flex flex-col justify-center items-center w-full flex-grow">
        <p className="mb-2 text-9xl text-center font-bold text-gray-700">404</p>
        <p className="mb-10 text-5xl text-center font-bold text-gray-700">Page not found</p>
        <TfiFaceSad className="block w-[180px] h-[180px] mb-6 fill-gray-700" />
        <button
          className="auth-btn w-[150px] text-xl bg-blue-100"
          onClick={() => navigate("/", {replace: true})}
        >
          Go back
        </button>
      </div>
    </section>
  )
};

export default NotFoundPage;