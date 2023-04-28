import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { HiAtSymbol } from "react-icons/hi";
import { FaInfoCircle, FaInstagram, FaFacebookSquare, FaTwitter } from "react-icons/fa";

import Alert from "../Alert";
import Input from "../AuthFormInputs/Input";
import { UserRootState } from "../../redux/store";
import { FB_REGEX, IG_REGEX, NAME_REGEX, TW_REGEX, USERNAME_REGEX } from "../../utils/consts";
import { useUpdateProfileMutation } from "../../redux/accountApi";
import { setCurrentUser } from "../../redux/features/userSlice";

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
  instagram: z
    .string()
    .regex(IG_REGEX, {message: "Invalid instagram profile url"})
    .optional(),
  facebook: z
    .string()
    .regex(FB_REGEX, {message: "Invalid facebook profile url"})
    .optional(),
  twitter: z
    .string()
    .regex(TW_REGEX, {message: "Invalid twitter profile url"})
    .optional()
});

export type ProfileFormSchemaType = z.infer<typeof FormSchema>;

interface Props {
  enabled: boolean;
  getProfileFormBtnsRef: (ref: HTMLDivElement) => void;
  setEnabled: Dispatch<SetStateAction<boolean>>;
};

const ProfileForm = ({enabled, getProfileFormBtnsRef, setEnabled}: Props) => {
  const formButtonsRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<string | null>(null);
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null);

  const [updateProfile] = useUpdateProfileMutation();

  // Referencia del wrapper de los botones del formulario
  useEffect(() => {
    if (formButtonsRef) {
      getProfileFormBtnsRef(formButtonsRef.current!);
    }
  }, [formButtonsRef]);

  const methods = useForm<ProfileFormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstName: currentUser?.firstName,
      lastName: currentUser?.lastName,
      username: currentUser?.username,
      instagram: currentUser?.socialLinks.find(item => item.name === "instagram")?.link || "",
      facebook: currentUser?.socialLinks.find(item => item.name === "facebook")?.link || "",
      twitter: currentUser?.socialLinks.find(item => item.name === "twitter")?.link || ""
    }
  });

  /**
   * Confirmar la actualización del perfil.
   */
  const onSubmitHandler = async (values: ProfileFormSchemaType) => {
    try {
      setIsUpdatingProfile(true);
      setProfileUpdateError(null);
      
      const updatedUser = await updateProfile(values).unwrap();

      // Actualizar el state global del usuario
      dispatch(setCurrentUser(updatedUser));

      setProfileUpdateSuccess("Profile updated successfully");

      // Actualizar los valores del formulario
      const {socialLinks} = updatedUser;
      methods.reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        instagram: socialLinks.find(item => item.name === "instagram")?.link || "",
        facebook: socialLinks.find(item => item.name === "facebook")?.link || "",
        twitter: socialLinks.find(item => item.name === "twitter")?.link || ""
      });

      setEnabled(false);
      
    } catch (error: any) {
      setProfileUpdateError(error.message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (!currentUser) {
    return null;
  };

  return (
    <article className="w-full max-w-[500px] mx-auto px-4 py-8">
      <FormProvider {...methods}>
        <form
          className="flex flex-col gap-5"
          onSubmit={methods.handleSubmit(onSubmitHandler)}
          noValidate
        >
          <AnimatePresence>
            {(profileUpdateSuccess || profileUpdateError) && (
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
                type={profileUpdateSuccess ? "success" : "error"}
                message={profileUpdateSuccess || profileUpdateError || ""}
                dismissAlert={() => {
                  setProfileUpdateSuccess(null);
                  setProfileUpdateError(null);
                }}
              />
            </motion.div>
            )}
          </AnimatePresence>

          <div className="-mb-3">
              <p className="text-base text-gray-700 font-semibold">
                Profile info
              </p>
              <p className="flex items-center text-sm text-gray-500">
                <FaInfoCircle className="mr-1" />
                All fields are required.
              </p>
            </div>
          <Input
            id="firstName"
            type="text"
            name="firstName"
            placeholder="Your first name"
            disabled={!enabled || isUpdatingProfile}
            Icon={AiOutlineUser}
          />

          <Input
            id="lastName"
            type="text"
            name="lastName"
            placeholder="Your last name"
            disabled={!enabled || isUpdatingProfile}
            Icon={AiOutlineUser}
          />

          <Input
            id="username"
            type="text"
            name="username"
            placeholder="Your username"
            disabled={!enabled || isUpdatingProfile}
            Icon={HiAtSymbol}
          />

          <div className="flex flex-col gap-5">
            <div className="-mb-3">
              <p className="text-base text-gray-700 font-semibold">
                Social Links (Optional)
              </p>
              <p className="flex items-center text-sm text-gray-500">
                <FaInfoCircle className="mr-1" />
                Leave the field blank to delete it or if you don't want to update it.
              </p>
            </div>
            <Input
              id="instagram"
              type="text"
              name="instagram"
              placeholder="https://www.instagram.com/john.doe"
              disabled={!enabled || isUpdatingProfile}
              Icon={FaInstagram}
            />
            <Input
              id="facebook"
              type="text"
              name="facebook"
              placeholder="https://www.facebook.com/john.doe"
              disabled={!enabled || isUpdatingProfile}
              Icon={FaFacebookSquare}
            />
            <Input
              id="twitter"
              type="text"
              name="twitter"
              placeholder="https://www.twitter.com/john.doe"
              disabled={!enabled || isUpdatingProfile}
              Icon={FaTwitter}
            />
          </div>

          <div
            ref={formButtonsRef}
            className="flex justify-start items-center gap-2"
          >
            <button
              className="auth-btn"
              type="submit"
              disabled={!enabled || isUpdatingProfile}
            >
              <span className="block mx-auto">
                Save changes
              </span>
            </button>

            <button
              className="auth-btn"
              type="button"
              disabled={!enabled || isUpdatingProfile}
              onClick={() => {
                methods.reset();
                setEnabled(false);
              }}
            >
              <span className="block mx-auto text-red-600">
                Cancel
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </article>
  )
};

export default ProfileForm;