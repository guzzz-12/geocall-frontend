import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";

import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { PASSWORD_REGEX, INVALID_PASSWORD_MSG } from "../utils/consts";
import { useLoginUserMutation } from "../redux/api";
import { socketClient } from "../socket/socketClient";
import { setMyLocation } from "../redux/features/mapSlice";

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
  const dispatch = useDispatch();
  const [loginError, setLoginError] = useState<string | null>(null);

  const [userLogin, {isLoading}] = useLoginUserMutation();
  const methods = useForm<LoginFormSchemaType>({resolver: zodResolver(FormSchema)});


  /*-------------------------------------*/
  // Determinar la ubicación del usuario
  /*-------------------------------------*/
  const {myLocation} = useGetUserLocation();


  /*------------------------------------------------*/
  // Inicializar conexión con el servidor de socket
  // luego de determinar la ubicación del usuario
  /*------------------------------------------------*/
  useEffect(() => {
    if (myLocation) {
      dispatch(setMyLocation(myLocation))
    };
  }, [myLocation]);


  /*------------------------------*/
  // Procesar el inicio de sesión
  /*------------------------------*/
  const onSubmitHandler = async (values: LoginFormSchemaType) => {
    setLoginError(null);

    if (!myLocation) {
      return setLoginError("You need to grant us to get your location");
    };

    try {
      const data = await userLogin(values).unwrap();
      const {_id} = data.user;

      const location = {lat: myLocation.lat, lon: myLocation.lon};
      socketClient.userLogin(_id, location);

    } catch (error: any) {
      setLoginError(error.message);
    };
  };


  return (
    <section className="flex flex-col justify-start items-center w-full h-screen py-10">
      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-between gap-5 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <h1 className="text-center text-lg font-normal">
            Log in to GeoCall App
          </h1>

          <AnimatePresence>
            {loginError && (
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
                  message={loginError}
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
            disabled={isLoading}
            Icon={AiOutlineMail}
          />
          {/* Password input */}
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            disabled={isLoading}
            Icon={HiOutlineKey}
          />
          <button
            className="auth-btn mt-3 text-black bg-white hover:bg-slate-300 disabled:bg-gray-300 disabled:text-gray-500"
            type="submit"
            disabled={isLoading}
          >
            <span className="block mx-auto">
              Sign in with email and password
            </span>
          </button>
        </form>
      </FormProvider>

      <div className="flex flex-col justify-center items-center gap-2 mt-5">
        <p className="flex gap-1 text-center text-sm">
          Don't have an account?
          <Link 
            className="underline"
            to="/signup"
            onClick={(e) => isLoading && e.preventDefault()}
          >
            Create account
          </Link>
        </p>
        <p className="flex gap-1 text-center text-sm">
          Forgot your password?
          <Link
            className="underline"
            to="/forgot-password"
            onClick={(e) => isLoading && e.preventDefault()}
          >
            Reset your password
          </Link>
        </p>
      </div>
    </section>
  )
};

export default LoginPage;