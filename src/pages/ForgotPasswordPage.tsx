import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineMail } from "react-icons/ai";
import FormsWrapper from "../components/FormsWrapper";
import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import withoutAuthentication from "../components/HOC/withoutAuthentication";
import { useForgotPasswordMutation } from "../redux/api";

const FormSchema = z.object({
  email: z
    .string({required_error: "The email address is required"})
    .nonempty("The email is required")
    .email("Invalid email address")
});

export type ForgotPasswordSchemaType = z.infer<typeof FormSchema>;

const ForgotPassword = () => {
  document.title = "GeoCall App | Forgot Password";

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sendEmail, {isLoading}] = useForgotPasswordMutation();

  const methods = useForm<ForgotPasswordSchemaType>({resolver: zodResolver(FormSchema)});

  /**
   * Confirmar el envío del email
   */
  const onSubmitHandler = async (values: ForgotPasswordSchemaType) => {
    try {
      setSuccess(false);
      setError(null);

      await sendEmail(values).unwrap();

      setSuccess(true);
      methods.reset();

    } catch (error: any) {
      setError(error.message)
    }
  };

  return (
    <FormsWrapper>
      <FormProvider {...methods}>
        <form
          className="flex flex-col justify-between gap-3 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <div className="mb-6">
            <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
              Restore your password
            </h1>
            <p className="text-center text-sm text-gray-600">
              We will send you an email with instructions <br /> to restore your password
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
                  message={success ? "Email sent. Check your inbox" : error!}
                  dismissAlert={() => {
                    setError(null);
                    setSuccess(false);
                  }}
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

          <button
            className="auth-btn mt-3"
            type="submit"
            disabled={isLoading}
          >
            <span className="block mx-auto">
              Send email
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
      </div>
    </FormsWrapper>
  )
};

export default withoutAuthentication(ForgotPassword);