import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiOutlineMail } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";
import Input from "../components/AuthFormInputs/Input";
import { PASSWORD_REGEX, INVALID_PASSWORD_MSG } from "../utils/consts";
import { setMyLocation } from "../redux/features/mapSlice";
import { getFakeLocation } from "../utils/dummyLocations";

const FormSchema = z.object({
  email: z
    .string({required_error: "The email address is required"})
    .email("Invalid email address"),
  password: z
    .string({required_error: "The password is required"})
    .regex(PASSWORD_REGEX, {message: INVALID_PASSWORD_MSG})
    .min(6, "The password must contain at least 6 characters")
});

export type FormSchemaType = z.infer<typeof FormSchema>;

const LoginPage = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const methods = useForm<FormSchemaType>({resolver: zodResolver(FormSchema)});

  useEffect(() => {
    if ("navigator" in window) {
      navigator.geolocation.getCurrentPosition(
        (_position: GeolocationPosition) => {
          //! Usar la posición real sólo en producción
          // const {latitude, longitude} = position.coords;
          // dispatch(setMyLocation({lat: latitude, lon: longitude}));
  
          const fakeLocation = getFakeLocation();
          dispatch(setMyLocation(fakeLocation));
        },
        (err:GeolocationPositionError) => {
          setLocationError(err.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("This device is not compatible with the geolocation functionality")
    }
  }, []);

  const onSubmitHandler = (values: FormSchemaType) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log(values);
      setIsLoading(false);
      methods.reset();
    }, 2500);
  };

  return (
    <section className="flex flex-col justify-center items-center w-full h-screen py-3">
      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-between gap-5 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <h1 className="text-center text-lg font-bold">
            Log in to GeoCall App
          </h1>
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