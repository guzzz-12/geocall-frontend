import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineKey } from "react-icons/hi";

import Logo from "../components/Logo";
import FormsWrapper from "../components/FormsWrapper";
import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import withoutAuthentication from "../components/HOC/withoutAuthentication";
import { useResetPasswordMutation } from "../redux/api";
import { INVALID_PASSWORD_MSG, PASSWORD_REGEX } from "../utils/consts";

const FormSchema = z.object({
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required")
    .min(6, "The password must contain at least 6 characters")
    .regex(PASSWORD_REGEX, {message: INVALID_PASSWORD_MSG}),
  passwordConfirm: z
    .string()
    .nonempty("You must confirm your password")
})
.refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"]
});

export type ResetPasswordSchemaType = z.infer<typeof FormSchema>;


const ResetPasswordPage = () => {
  document.title = "GeoCall App | Reset Password";

  const [searchParams] = useSearchParams();
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetPassword, {isLoading}] = useResetPasswordMutation();

  const methods = useForm<ResetPasswordSchemaType>({resolver: zodResolver(FormSchema)});

  /**
   * Confirmar el cambio de contraseña
   */
  const onSubmitHandler = async (values: ResetPasswordSchemaType) => {
    try {
      setSuccess(false);
      setError(null);

      const token = searchParams.get("token");

      if (!token) {
        throw new Error("Invalid request")
      };

      await resetPassword({newPassword: values.password, token}).unwrap();

      setSuccess(true);
      methods.reset();

    } catch (error: any) {
      setError(error.message)
    }
  };

  return (
    <FormsWrapper>
      <FormProvider {...methods}>
        <div className="mb-5">
          <Logo size="lg" />
        </div>

        <form
          className="flex flex-col justify-between gap-3 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <div className="mb-6">
            <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="text-center text-sm text-gray-600">
              Create a new password for your GeoCall account
            </p>
          </div>

          <AnimatePresence>
            {(success || error) && (
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
                  type={success ? "success" : "error"}
                  message={success ? "Password successfully restored. Log in with your new password." : error!}
                  dismissAlert={() => {
                    setError(null);
                    setSuccess(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            id="newPassword"
            type="password"
            name="password"
            placeholder="Your new password"
            disabled={isLoading}
            Icon={HiOutlineKey}
          />

          <Input
            id="newPasswordConfirm"
            type="password"
            name="passwordConfirm"
            placeholder="Your new password"
            disabled={isLoading}
            Icon={HiOutlineKey}
          />

          {!success &&
            <div className="flex gap-1">
              <button
                className="auth-btn mt-3"
                type="submit"
                disabled={isLoading}
              >
                <span className="block mx-auto">
                  Confirm
                </span>
              </button>
              <Link
                to="/login"
                replace
                className="auth-btn mt-3"
                onClick={(e) => isLoading && e.preventDefault()}
              >
                <span className="block mx-auto">
                  Cancel
                </span>
              </Link>
            </div>
          }

          {success &&
            <Link
              className="auth-btn mt-3"
              to="/login"
            >
              <span className="block mx-auto">
                Go to login page
              </span>
            </Link>
          }
        </form>
      </FormProvider>
    </FormsWrapper>
  )
};

export default withoutAuthentication(ResetPasswordPage);