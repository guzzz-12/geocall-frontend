import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { AnimatePresence,motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tooltip } from "react-tooltip";
import { AiOutlinePoweroff } from "react-icons/ai";
import { HiOutlineKey } from "react-icons/hi";

import FormsWrapper from "../components/FormsWrapper";
import Input from "../components/AuthFormInputs/Input";
import Alert from "../components/Alert";
import { UserRootState } from "../redux/store";
import { socketClient } from "../socket/socketClient";
import { api, useVerifyAccountMutation } from "../redux/api";
import { removeCurrentUser, setCurrentUser } from "../redux/features/userSlice";
import { clearMapState } from "../redux/features/mapSlice";

const FormSchema = z.object({
  code: z
    .string({required_error: "The code is required"})
    .nonempty("The code is required")
    .min(6, {message: "The code must contain exactly 6 characters"})
    .max(6, {message: "The code must contain exactly 6 characters"})
    .regex(/^[0-9]{6}/, {message: "The code can contain numbers only"})
});

export type CodeFormSchemaType = z.infer<typeof FormSchema>;

const VerifyAccountPage = () => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {isLoading, currentUser} = useSelector((state: UserRootState) => state.user);

  const [success, setSuccess] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [verifyAccount, {isLoading: isVerifying}] = useVerifyAccountMutation();
  const [getVerificationCode, {isLoading: loadingCode}] = api.endpoints.getVerificationCode.useLazyQuery();

  const methods = useForm<CodeFormSchemaType>({resolver: zodResolver(FormSchema)});


  /**
   * Confirmar la verificación de la cuenta.
   */
  const onSubmitHandler = async (values: CodeFormSchemaType) => {
    try {
      setSuccess(null);
      setVerificationError(null);

      const verifiedUser = await verifyAccount({code: values.code}).unwrap();

      setSuccess("Account successfully verified.");

      setTimeout(() => {
        dispatch(setCurrentUser(verifiedUser));
      }, 2000);
      
    } catch (error: any) {
      setVerificationError(error.message)
    }
  };

  /**
   * Solicitar un nuevo código de verificación.
   */
  const newVerificationCodeHandler = async () => {
    try {
      setVerificationError(null);
      setSuccess(null);

      await getVerificationCode().unwrap();

      setSuccess(`A new verification code was sent to ${currentUser!.email}. Check your inbox.`) 
      
    } catch (error: any) {
      const fallbackMsg = "Error requesting code. Try again later.";
      setVerificationError(error.message || fallbackMsg);
    }
  };

  /**
   * Cancelar la verificación y salir.
   */
  const logoutHandler = () => {
    dispatch(api.util.resetApiState());
    dispatch(removeCurrentUser());
    dispatch(clearMapState());
    socketClient.userLogout(currentUser!._id);
    navigate("/login", {replace: true});
  };

  if (isLoading) {
    return null;
  };

  if (!isLoading && !currentUser && !token) {
    return <Navigate to="/login" replace />
  };

  if (!isLoading && currentUser && currentUser.emailVerified) {
    return <Navigate to="/map" replace />
  };

  const loading = isLoading || loadingCode || isVerifying;

  return (
    <FormsWrapper>
      <FormProvider {...methods}>
        <form
          className="relative flex flex-col justify-between gap-5 w-[450px] p-5 rounded bg-white shadow-lg"
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <Tooltip id="logout-button-tooltip" />
          <AiOutlinePoweroff
            style={{cursor: loading ? "default" : "pointer"}}
            className="absolute top-3 right-3 w-7 h-7 opacity-[0.65]"
            data-tooltip-id="logout-button-tooltip"
            data-tooltip-content="Exit"
            onClick={() => {
              if (loading) return false;
              logoutHandler();
            }}
          />

          <div className="mb-0">
            <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
              Verify your account
            </h1>
            <p className="text-center text-sm text-gray-600">
              Copy the 6 digit code that we sent you
            </p>
          </div>

          <div className="w-full h-[1px] bg-gray-100"/>

          <AnimatePresence>
            {(success || verificationError) && (
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
                  message={success ? success : verificationError!}
                  dismissAlert={() => {
                    setSuccess(null);
                    setVerificationError(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col justify-center items-center">
            <p className="mb-2 text-center text-base text-gray-600">
              Didn't receive the code?
            </p>
            <button
              className="auth-btn text-sm text-gray-800"
              type="button"
              disabled={loading}
              onClick={newVerificationCodeHandler}
            >
              <span className="block mx-auto">
                Send new code
              </span>
            </button>
          </div>

          <div className="w-full h-[1px] bg-gray-100"/>

          <Input
            id="code"
            type="text"
            name="code"
            placeholder="Your verification code"
            disabled={loading}
            Icon={HiOutlineKey}
          />
          
          <button
            className="auth-btn text-sm"
            type="submit"
            disabled={loading}
          >
            <span className="block mx-auto">
              Verify account
            </span>
          </button>
        </form>
      </FormProvider>
    </FormsWrapper>
  )
};

export default VerifyAccountPage;