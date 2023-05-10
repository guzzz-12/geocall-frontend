import { RefObject, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGoogleLoginMutation } from "../redux/api";
import { setCurrentUser } from "../redux/features/userSlice";

const GOOGLE_CLIENT_ID = "93253641313-hm2khddk0pcj4mom429k4pu036rl1mag.apps.googleusercontent.com";

interface Props {
  btnRef: RefObject<HTMLButtonElement>;
};

/**
 * Iniciar sesión o registrar un usuario con Google
 */
const useGoogleAuth = ({btnRef}: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  const [googleLogin, {isLoading: loadingGoogleAuth}] = useGoogleLoginMutation();

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (authResponse) => {
        try {
          const data = await googleLogin({googleTokenId: authResponse.credential}).unwrap();
          dispatch(setCurrentUser(data));
          navigate("/map", {replace: true});
        } catch (error: any) {
          setGoogleAuthError(error.message)
        }
      }
    });

    if (btnRef) {
      google.accounts.id.renderButton(
        btnRef.current!,
        {theme: "filled_blue", text: "continue_with", locale: "EN"}
      )
    };
  }, [btnRef]);

  return {loadingGoogleAuth, googleAuthError}
};

export default useGoogleAuth;