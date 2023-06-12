import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";

import FormsWrapper from "../components/FormsWrapper";
import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import Logo from "../components/Logo";
import withoutAuthentication from "../components/HOC/withoutAuthentication";
import useGoogleAuth from "../hooks/useGoogleAuth";
import { useLoginUserMutation } from "../redux/api";
import { RootState } from "../redux/store";
import { setCurrentUser } from "../redux/features/userSlice";
import { PASSWORD_REGEX, INVALID_PASSWORD_MSG } from "../utils/consts";


const FormSchema = z.object({
  email: z
    .string({required_error: "The email address is required"})
    .nonempty("The email is required")
    .email("Invalid email address"),
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required")
    .min(6, "The password must contain at least 6 characters")
    .regex(PASSWORD_REGEX, {message: INVALID_PASSWORD_MSG})
});

export type LoginFormSchemaType = z.infer<typeof FormSchema>;

const LoginPage = () => {
  document.title = "GeoCall App | Login";

  const googleBtnRef = useRef<HTMLButtonElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {myLocation} = useSelector((state: RootState) => state.map);

  const [loginError, setLoginError] = useState<string | null>(null);

  // Iniciar sesión con credenciales
  const [loginUser, {isLoading}] = useLoginUserMutation();

  // Iniciar sesión con Google
  const {googleAuthError, loadingGoogleAuth} = useGoogleAuth({btnRef: googleBtnRef});

  const methods = useForm<LoginFormSchemaType>({resolver: zodResolver(FormSchema)});

  /*------------------------------*/
  // Procesar el inicio de sesión
  /*------------------------------*/
  const onSubmitHandler = async (values: LoginFormSchemaType) => {
    setLoginError(null);

    if (!myLocation) {
      return setLoginError("Unable to get your location. Refresh the page and try again.");
    };

    try {
      const data = await loginUser(values).unwrap();

      dispatch(setCurrentUser(data));

      navigate("/map", {replace: true});
      
    } catch(error: any) {
      setLoginError(error.message);
    }
  };


  return (
    <FormsWrapper>
      <FormProvider {...methods}>
        <div className="mb-5">
          <Logo size="md" />
        </div>

        <form
          className="flex flex-col justify-between gap-5 w-full max-w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <h1 className="text-center text-lg font-bold">
            Log in to GeoCall
          </h1>

          <AnimatePresence>
            {(loginError || googleAuthError) && (
              <motion.div
                key="alert"
                className="-z-1"
                initial={{height: 0, opacity: 0}}
                animate={{height: "auto", opacity: 1}}
                exit={{height: 0, opacity: 0}}
                transition={{duration: 0.3}}
              >
                <Alert
                  key="alert"
                  type="error"
                  message={loginError ? loginError : googleAuthError!}
                  dismissAlert={() => setLoginError(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email input */}
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Your email address"
            disabled={isLoading || loadingGoogleAuth}
            Icon={AiOutlineMail}
          />
          {/* Password input */}
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            disabled={isLoading || loadingGoogleAuth}
            Icon={HiOutlineKey}
          />
          <button
            className="auth-btn"
            type="submit"
            disabled={isLoading || loadingGoogleAuth}
          >
            <span className="block mx-auto">
              Login
            </span>
          </button>

          <div className="flex justify-between items-center gap-5 w-full">
            <div className="w-full h-[1px] bg-gray-300" />
            <p className="text-gray-700">OR</p>
            <div className="w-full h-[1px] bg-gray-300" />
          </div>
          
          <button
            ref={googleBtnRef}
            className="mx-auto"
            type="button"
            disabled={isLoading || loadingGoogleAuth}
          />
        </form>
      </FormProvider>

      <div className="flex flex-col justify-center items-center gap-2 mt-5">
        <p className="flex gap-1 text-center text-sm">
          Don't have an account?
          <Link 
            className="underline"
            to="/signup"
            onClick={(e) => (isLoading || loadingGoogleAuth) && e.preventDefault()}
          >
            Create account
          </Link>
        </p>
        <p className="flex gap-1 text-center text-sm">
          Forgot your password?
          <Link
            className="underline"
            to="/forgot-password"
            onClick={(e) => (isLoading || loadingGoogleAuth) && e.preventDefault()}
          >
            Reset your password
          </Link>
        </p>
      </div>
    </FormsWrapper>
  )
};

export default withoutAuthentication(LoginPage);