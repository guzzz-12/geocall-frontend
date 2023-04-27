import { Dispatch, SetStateAction } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { HiOutlineKey } from "react-icons/hi";
import Alert from "../Alert";
import Input from "../AuthFormInputs/Input";
import { PasswordFormSchemaType } from "./Security";

interface Props {
  success: string | null;
  error: string | null;
  loading: boolean;
  animationProps: AnimationProps;
  methods: UseFormReturn<PasswordFormSchemaType>;
  onSubmitHandler: (values: PasswordFormSchemaType) => Promise<void>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
  setError: Dispatch<SetStateAction<string | null>>;
};

const PasswordChangeForm = ({success, error, setSuccess, setError, loading, animationProps, methods, onSubmitHandler}: Props) => {
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-3 w-[450px] mx-auto px-4 py-3 rounded-md bg-white shadow-md"
        noValidate
        onSubmit={methods.handleSubmit(onSubmitHandler)}
      >
        <div className="flex justify-center items-center gap-3 w-full">
          <HiOutlineKey className="w-6 h-6 opacity-50" />
          <p className="text-left font-bold text-gray-500">
            Change your password
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
          id="password"
          type="password"
          name="password"
          placeholder="Your current password"
          disabled={loading}
          Icon={HiOutlineKey}
        />
        <Input
          id="newPassword"
          type="password"
          name="newPassword"
          placeholder="Your new password"
          disabled={loading}
          Icon={HiOutlineKey}
        />
        <Input
          id="newPasswordConfirm"
          type="password"
          name="passwordConfirm"
          placeholder="Confirm your new password"
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

export default PasswordChangeForm;