import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";

import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import withoutAuthentication from "../components/HOC/withoutAuthentication";
import { PASSWORD_REGEX, INVALID_PASSWORD_MSG } from "../utils/consts";
import { useLoginUserMutation } from "../redux/api";
import { MapRootState } from "../redux/store";
import { setCurrentUser } from "../redux/features/userSlice";

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
  const navigate = useNavigate();
  const {myLocation} = useSelector((state: MapRootState) => state.map);

  const [loginError, setLoginError] = useState<string | null>(null);

  const [loginUser, {isLoading}] = useLoginUserMutation();
  const methods = useForm<LoginFormSchemaType>({resolver: zodResolver(FormSchema)});

  /*------------------------------*/
  // Procesar el inicio de sesión
  /*------------------------------*/
  const onSubmitHandler = async (values: LoginFormSchemaType) => {
    setLoginError(null);

    if (!myLocation) {
      return setLoginError("You need to grant us to get your location");
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
            className="auth-btn"
            type="submit"
            disabled={isLoading}
          >
            <span className="block mx-auto">
              Login
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

export default withoutAuthentication(LoginPage);