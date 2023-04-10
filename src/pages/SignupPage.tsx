import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";

import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import useGetUserLocation from "../hooks/useGetUserLocation";
import { NAME_REGEX, PASSWORD_REGEX, INVALID_PASSWORD_MSG, USERNAME_REGEX } from "../utils/consts";
import { useSignupUserMutation } from "../redux/api";
import { connectWithSocketServer } from "../socket/socketConnection";

const FormSchema = z.object({
  firstName: z
    .string()
    .min(3, "The name must be at least 3 characters")
    .max(32, "The name must be maximum 32 character")
    .regex(NAME_REGEX, "The name can contain only letters without white spaces"),
  lastName: z
    .string()
    .min(3, "The last name must be at least 3 characters")
    .max(32, "The last name must be maximum 32 character")
    .regex(NAME_REGEX, "The last name can contain only letters without white spaces"),
  username: z
    .string()
    .min(3, "The username must be at least 3 characters")
    .max(32, "The username must be maximum 32 character")
    .regex(USERNAME_REGEX, "The username must start with a letter and can contain only alphanumeric characters, underscores (_) and hyphens (-)"),
  email: z
    .string({required_error: "The email address is required"})
    .email("Invalid email address"),
  password: z
    .string({required_error: "The password is required"})
    .regex(PASSWORD_REGEX, {message: INVALID_PASSWORD_MSG})
    .min(6, "The password must contain at least 6 characters"),
  passwordConfirm: z
    .string()
    .nonempty("You must confirm your password")
})
.refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"]
});

export type SignupFormSchemaType = z.infer<typeof FormSchema>;

const SignupPage = () => {
  const [signupError, setSignupError] = useState<string | null>(null);

  const methods = useForm<SignupFormSchemaType>({resolver: zodResolver(FormSchema)});

  const [signupUser, {isLoading}] = useSignupUserMutation();


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
      connectWithSocketServer();
    };
  }, [myLocation]);


  /*----------------------------------*/
  // Procesar el registro del usuario
  /*----------------------------------*/
  const onSubmitHandler = async (values: SignupFormSchemaType) => {
    setSignupError(null);
    
    signupUser(values)
    .unwrap()
    .catch((error) => {
      const msg = typeof error === "string" ? error : "Something went wrong, try again later";
      setSignupError(msg);
    });
  };


  return (
    <section className="flex flex-col justify-start items-center w-full min-h-screen py-10">
      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-between gap-5 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <h1 className="text-center text-lg font-bold">
            Signup to GeoCall App
          </h1>

          <AnimatePresence>
            {signupError && (
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
                message={signupError}
                dismissAlert={() => setSignupError(null)}
              />
            </motion.div>
            )}
          </AnimatePresence>

          <Input
            id="firstName"
            type="text"
            name="firstName"
            placeholder="Your first name"
            disabled={isLoading}
            Icon={AiOutlineUser}
          />

          <Input
            id="lastName"
            type="text"
            name="lastName"
            placeholder="Your last name"
            disabled={isLoading}
            Icon={AiOutlineUser}
          />

          <Input
            id="username"
            type="text"
            name="username"
            placeholder="Your username"
            disabled={isLoading}
            Icon={AiOutlineUser}
          />

          <Input
            id="email"
            type="email"
            name="email"
            placeholder="Your email address"
            disabled={isLoading}
            Icon={AiOutlineMail}
          />

          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Your password"
            disabled={isLoading}
            Icon={HiOutlineKey}
          />

          <Input
            id="passwordConfirm"
            type="password"
            name="passwordConfirm"
            placeholder="Confirm your password"
            disabled={isLoading}
            Icon={HiOutlineKey}
          />

          <button
            className="auth-btn mt-3 text-black bg-white hover:bg-slate-300 disabled:bg-gray-300 disabled:text-gray-500"
            type="submit"
            disabled={isLoading}
          >
            <span className="block mx-auto">
              Sign up with email and password
            </span>
          </button>
        </form>
      </FormProvider>

      <div className="flex flex-col justify-center items-center gap-2 mt-5">
        <p className="flex gap-1 text-center text-sm">
          Already have an account?
          <Link
            className="underline"
            to="/login"
            onClick={(e) => isLoading && e.preventDefault()}
          >
            Login instead
          </Link>
        </p>
      </div>

    </section>
  )
};

export default SignupPage;