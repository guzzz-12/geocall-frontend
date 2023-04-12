import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TfiWorld } from "react-icons/tfi";
import { UserRootState } from "../redux/store";
import { api, useLogoutUserMutation } from "../redux/api";
import { removeCurrentUser } from "../redux/features/userSlice";
import { clearMapState } from "../redux/features/mapSlice";
import { socketClient } from "../socket/socketClient";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {currentuser} = useSelector((state: UserRootState) => state.user);

  const [logoutUser, {isLoading}] = useLogoutUserMutation();

  /**
   * Cerrar la sesión del usuario,
   * resetear el state de RTK,
   * limpiar el state del usuario,
   * limpiar el state del mapa,
   * emitir evento logout de socket y
   * redirigir a la pantalla de login.
   */
  const logoutHandler = async () => {
    await logoutUser();
    dispatch(api.util.resetApiState());
    dispatch(removeCurrentUser());
    dispatch(clearMapState());
    socketClient.userLogout(currentuser!._id);
    navigate("/login", {replace: true});
  };

  return (
    <nav className="absolute top-2 left-[50%] mx-2 -translate-x-[50%] flex justify-between items-center w-[95%] max-w-[600px] px-3 py-2 rounded border border-gray-500 bg-slate-50 z-[2]">
      <div className="flex justify-between items-center gap-2">
        <TfiWorld className="w-9 h-9 text-gray-400" />
        <h1 className="text-lg font-bold uppercase text-gray-600">
          GeoCall
        </h1>
      </div>
      <div className="flex justify-center items-stretch gap-2">
        <div className="flex justify-center items-center gap-2 px-2 py-1 border border-slate-400 rounded-md cursor-pointer">
          <div className="w-8 h-8 overflow-hidden">
            <img
              src={currentuser!.avatar}
              className="block w-full h-full object-cover object-center rounded-full outline-2 outline-blue-500"
            />
          </div>
          <p className="text-base font-bold text-gray-600">
            {currentuser!.firstName}
          </p>
        </div>
        <button
          className="px-2 py-1 text-center text-base font-normal text-blue-600 uppercase rounded bg-blue-50 hover:bg-blue-100 disabled:bg-slate-300 disabled:cursor-default transition-colors"
          disabled={isLoading}
          onClick={logoutHandler}
        >
          Logout
        </button>
      </div>
    </nav>
  )
};

export default Navbar;