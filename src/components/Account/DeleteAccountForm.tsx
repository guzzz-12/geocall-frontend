import { Dispatch, SetStateAction } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { AnimatePresence, AnimationProps, motion } from "framer-motion";
import { HiOutlineKey } from "react-icons/hi";
import { MdOutlineWarning } from "react-icons/md";
import Alert from "../Alert";
import Input from "../AuthFormInputs/Input";
import { DeleteAccountFormSchemaType } from "./Security";

interface Props {
  error: string | null;
  loading: boolean;
  animationProps: AnimationProps;
  methods: UseFormReturn<DeleteAccountFormSchemaType>;
  onSubmitHandler: (values: DeleteAccountFormSchemaType) => Promise<void>;
  setError: Dispatch<SetStateAction<string | null>>;
};

const DeleteAccountForm = ({error, loading, animationProps, methods, setError, onSubmitHandler}: Props) => {
  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-3 w-[450px] mx-auto px-4 py-3 rounded-md bg-white shadow-md"
        noValidate
        onSubmit={methods.handleSubmit(onSubmitHandler)}
      >
        <div>
          <div className="flex justify-center items-center gap-3 w-full">
            <MdOutlineWarning className="w-6 h-6 fill-red-700" />
            <p className="text-left font-bold text-gray-500">
              Delete your account permanently
            </p>
          </div>
          <p className="text-xs text-center text-red-700">
            This action cannot be undone
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              key="alert"
              className="-z-1"
              {...animationProps}
            >
              <Alert
                key="alert"
                type="error"
                message={error}
                dismissAlert={() => setError(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full h-[1px] mb-3 bg-gray-200" />

        <Input
          id="password-3"
          type="password"
          name="password"
          placeholder="Your password"
          disabled={loading}
          Icon={HiOutlineKey}
        />

        <button
          className="auth-btn text-sm text-red-700 bg-red-50"
          type="submit"
          disabled={loading}
        >
          <span className="block mx-auto">
            Delete account permanently
          </span>
        </button>
      </form>
    </FormProvider>
  )
};

export default DeleteAccountForm;