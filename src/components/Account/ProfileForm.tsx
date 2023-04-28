import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { FaInstagram, FaFacebookSquare, FaTwitter } from "react-icons/fa";
import Alert from "../Alert";
import Input from "../AuthFormInputs/Input";
import { NAME_REGEX, USERNAME_REGEX } from "../../utils/consts";
import { UserRootState } from "../../redux/store";

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
  .min(0),
  facebook: z
  .string()
  .min(0),
  twitter: z
  .string()
  .min(0)
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
  const navigate = useNavigate();

  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<string | null>(null);
  const [profileUpdateError, setProfileUpdateError] = useState<string | null>(null);

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
      username: currentUser?.username
    }
  });

  const onSubmitHandler = async (values: ProfileFormSchemaType) => {
    console.log({values});
  };

  if (!currentUser) {
    return null;
  };

  return (
    <article className="w-full max-w-[500px] mx-auto px-4 py-10">
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
                type="error"
                message={profileUpdateSuccess || profileUpdateError || ""}
                dismissAlert={() => {
                  setProfileUpdateSuccess(null);
                  setProfileUpdateError(null);
                }}
              />
            </motion.div>
            )}
          </AnimatePresence>

          <Input
            id="firstName"
            type="text"
            name="firstName"
            placeholder="Your first name"
            disabled={!enabled}
            Icon={AiOutlineUser}
          />

          <Input
            id="lastName"
            type="text"
            name="lastName"
            placeholder="Your last name"
            disabled={!enabled}
            Icon={AiOutlineUser}
          />

          <Input
            id="username"
            type="text"
            name="username"
            placeholder="Your username"
            disabled={!enabled}
            Icon={AiOutlineUser}
          />

          <div className="flex flex-col gap-2">
            <p className="text-sm">
              Leave blank the field to delete or if you don't want to update it.
            </p>
            <Input
              id="instagram"
              type="text"
              name="instagram"
              placeholder="https://www.instagram.com/john.doe"
              disabled={!enabled}
              Icon={FaInstagram}
            />
            <Input
              id="facebook"
              type="text"
              name="facebook"
              placeholder="https://www.facebook.com/john.doe"
              disabled={!enabled}
              Icon={FaFacebookSquare}
            />
            <Input
              id="twitter"
              type="text"
              name="twitter"
              placeholder="https://www.twitter.com/john.doe"
              disabled={!enabled}
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
              disabled={!enabled}
            >
              <span className="block mx-auto">
                Save changes
              </span>
            </button>

            <button
              className="auth-btn"
              type="button"
              disabled={!enabled}
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