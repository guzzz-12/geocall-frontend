import { Dispatch, SetStateAction } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { HiOutlineKey } from "react-icons/hi";
import { AiOutlineMail } from "react-icons/ai";
import Alert from "../Alert";
import Input from "../AuthFormInputs/Input";
import { EmailFormSchemaType } from "./Security";

interface Props {
  success: string | null;
  error: string | null;
  loading: boolean;
  animationProps: AnimationProps;
  methods: UseFormReturn<EmailFormSchemaType>;
  onSubmitHandler: (values: EmailFormSchemaType) => Promise<void>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
};

const EmailChangeForm = ({success, error, setSuccess, setError, loading, animationProps, methods, onSubmitHandler}: Props) => {
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-3 w-[450px] mx-auto px-4 py-3 rounded-md bg-white shadow-md"
        noValidate
        onSubmit={methods.handleSubmit(onSubmitHandler)}
      >
        <div>
          <div className="flex justify-center items-center gap-3 w-full">
            <AiOutlineMail className="w-6 h-6 opacity-50" />
            <p className="text-left font-bold text-gray-500">
              Change your email address
            </p>
          </div>
          <p className="text-xs text-center text-red-700">
            You will be required to verify your new email address. <br />
            Make sure to use a real email address <br />
            or you will lose access to your account!
          </p>
        </div>

        <AnimatePresence>
          {(success || error) && (
            <motion.div
              key="alert"
              className="-z-1"
              {...animationProps}
            >
              <Alert
                key="alert"
                type={success ? "success" : "error"}
                message={success || error || ""}
                dismissAlert={() => {
                  setSuccess(null);
                  setError(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-[1px] mb-3 bg-gray-200" />

        <Input
          id="newEmail"
          type="email"
          name="newEmail"
          placeholder="Your new email address"
          disabled={loading}
          Icon={AiOutlineMail}
        />

        <Input
          id="emailFormPassword"
          type="password"
          name="password"
          placeholder="Password"
          disabled={loading}
          Icon={HiOutlineKey}
        />

        <button
          className="auth-btn text-sm"
          type="submit"
          disabled={loading}
        >
          <span className="block mx-auto">
            Save changes
          </span>
        </button>
      </form>
    </FormProvider>
  )
};

export default EmailChangeForm;