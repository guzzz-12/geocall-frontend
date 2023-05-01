import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimationProps } from "framer-motion";
import { toast } from "react-toastify";

import ContentWrapper from "./ContentWrapper";
import PasswordChangeForm from "./PasswordChangeForm";
import DeleteChatsForm from "./DeleteChatsForm";
import DeleteAccountForm from "./DeleteAccountForm";
import EmailChangeForm from "./EmailChangeForm";
import { INVALID_PASSWORD_MSG, PASSWORD_REGEX } from "../../utils/consts";
import { useChangeEmailMutation, useChangePasswordMutation, useDeleteAccountMutation } from "../../redux/accountApi";
import { setCurrentUser, removeCurrentUser } from "../../redux/features/userSlice";
import { socketClient } from "../../socket/socketClient";
import { User, useCheckPasswordMutation } from "../../redux/api";
import db from "../../db/GeoCallDB";

const PasswordFormSchema = z.object({
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required"),
  newPassword: z
    .string({required_error: "The new password is required"})
    .nonempty("The new password is required")
    .min(6, "The password must contain at least 6 characters")
    .regex(PASSWORD_REGEX, {message: INVALID_PASSWORD_MSG}),
  passwordConfirm: z
    .string({required_error: "Confirm your password"})
    .nonempty("Confirm your password")
})
.refine((data) => data.newPassword === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"]
});


const EmailFormSchema = z.object({
  newEmail: z
    .string({required_error: "The email address is required"})
    .nonempty("The email is required")
    .email("Invalid email address"),
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required")
});


const DeleteAccountFormSchema = z.object({
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required")
});

const DeleteChatsFormSchema = z.object({
  password: z
    .string({required_error: "The password is required"})
    .nonempty("The password is required")
});


export type EmailFormSchemaType = z.infer<typeof EmailFormSchema>;
export type PasswordFormSchemaType = z.infer<typeof PasswordFormSchema>;
export type DeleteAccountFormSchemaType = z.infer<typeof DeleteAccountFormSchema>;
export type DeleteChatsFormSchemaType = z.infer<typeof DeleteChatsFormSchema>;


const animationProps: AnimationProps = {
  initial: {height: 0, opacity: 0},
  animate: {height: "auto", opacity: 1},
  exit: {height: 0, opacity: 0},
  transition: {duration: 0.3}
};


interface Props {
  currentUser: User;
};

const Security = ({currentUser}: Props) => {
  const dispatch = useDispatch();

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);

  const [deletingChats, setDeletingChats] = useState(false);
  const [deleteChatsError, setDeleteChatsError] = useState<string | null>(null);

  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  const [changeEmail] = useChangeEmailMutation();
  const [changePassword] = useChangePasswordMutation();
  const [checkPassword] = useCheckPasswordMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const passwordMethods = useForm<PasswordFormSchemaType>({resolver: zodResolver(PasswordFormSchema)});
  const emailMethods = useForm<EmailFormSchemaType>({resolver: zodResolver(EmailFormSchema)});
  const deleteChatsMethods = useForm<DeleteChatsFormSchemaType>({resolver: zodResolver(DeleteChatsFormSchema)});
  const deleteAccountMethods = useForm<DeleteAccountFormSchemaType>({resolver: zodResolver(DeleteAccountFormSchema)});

  /**
   * Confirmar el cambio de contraseña.
   */
  const onSubmitPasswordHandler = async (values: PasswordFormSchemaType) => {
    setChangingPassword(true);
    setPasswordChangeSuccess(null);
    setPasswordChangeError(null);
    
    try {
      const updatedUser = await changePassword(values).unwrap();
      setPasswordChangeSuccess("Password updated successfully.");
      dispatch(setCurrentUser(updatedUser));
      passwordMethods.reset();
    } catch (error: any) {
      setPasswordChangeError(error.message);
    } finally {
      setChangingPassword(false);      
    };
  };

  /**
   * Confirmar el cambio de email.
   */
  const onSubmitEmailHandler = async (values: EmailFormSchemaType) => {
    setChangingEmail(true);
    setEmailChangeSuccess(null);
    setEmailChangeError(null);

    try {
      const updatedUser = await changeEmail(values).unwrap();
      
      toast.success(
        "Email updated successfully. Check your inbox to verify the new email address"
      );
      
      dispatch(setCurrentUser(updatedUser));
      
    } catch (error: any) {
      setEmailChangeError(error.message);

    } finally {
      setChangingEmail(false);
    };
  };

  /**
   * Eliminar todo el historial de chats del usuario.
   */
  const onDeleteChatsHandler = async (values: DeleteChatsFormSchemaType) => {
    setDeletingChats(true);
    setDeleteChatsError(null);

    try {
      await checkPassword(values).unwrap();

      await db.chats.where("localUser").equals(currentUser._id).delete();

      toast.success("All chats were deleted successfully");

      deleteChatsMethods.reset();
      
    } catch (error: any) {
      setDeleteChatsError(`Error deleting chats: ${error.message}`)
    } finally {
      setDeletingChats(false);
    }
  };

  /**
   * Confirmar la eliminación de la cuenta.
   */
  const onDeleteAccountHandler = async (values: DeleteAccountFormSchemaType) => {
    setDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      await deleteAccount(values).unwrap();

      socketClient.userLogout(currentUser!._id);

      dispatch(removeCurrentUser());

      toast.success("Account deleted successfully.");
      
    } catch (error: any) {
      setDeletingAccount(false);
      setDeleteAccountError(error.message);
    }
  };

  return (
    <ContentWrapper sectionTitle="Security settings">
      {/* Formulario de cambio de contraseña */}
      <PasswordChangeForm
        animationProps={animationProps}
        methods={passwordMethods}
        success={passwordChangeSuccess}
        error={passwordChangeError}
        loading={changingPassword}
        onSubmitHandler={onSubmitPasswordHandler}
        setSuccess={setPasswordChangeSuccess}
        setError={setPasswordChangeError}
      />

      {/* Formulario de cambio de email */}
      <EmailChangeForm
        animationProps={animationProps}
        methods={emailMethods}
        success={emailChangeSuccess}
        error={emailChangeError}
        loading={changingEmail}
        onSubmitHandler={onSubmitEmailHandler}
        setSuccess={setEmailChangeSuccess}
        setError={setEmailChangeError}
      />

      {/* Formulario de eliminación de cuenta */}
      <DeleteChatsForm
        animationProps={animationProps}
        methods={deleteChatsMethods}
        error={deleteChatsError}
        loading={deletingChats}
        onSubmitHandler={onDeleteChatsHandler}
        setError={setDeleteChatsError}
      />

      {/* Formulario de eliminación de cuenta */}
      <DeleteAccountForm
        animationProps={animationProps}
        methods={deleteAccountMethods}
        error={deleteAccountError}
        loading={deletingAccount}
        onSubmitHandler={onDeleteAccountHandler}
        setError={setDeleteAccountError}
      />
    </ContentWrapper>
  )
};

export default Security;