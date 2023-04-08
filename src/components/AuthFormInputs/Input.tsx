import {useState, ElementType } from "react";
import { useFormContext } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { RiErrorWarningFill } from "react-icons/ri";

interface Props {
  id: string;
  name: "username" | "email" | "password" | "passwordConfirm";
  type: "text" | "email" | "password" | "number";
  placeholder: string;
  disabled: boolean;
  Icon: ElementType;
};

const Input = ({id, name, type, placeholder, disabled, Icon}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const {register, formState: {errors}} = useFormContext();

  const isInvalid = !!errors[name];

  return (
    <>
      <div className="relative flex flex-col gap-1 basis-full grow-0">
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-event-none">
          <span className="text-base text-gray-500">
            <Icon />
          </span>
        </div>

        <input
          id={id}
          className={`${isInvalid && "border-red-700"} block w-full h-[45px] pl-8 px-10 text-sm rounded-md border border-gray-300 outline-offset-2 outline-transparent focus:border-blue-500 focus:ring-indigo-500 focus:ring-2`}
          placeholder={placeholder}
          disabled={disabled}
          type={type === "password" && showPassword ? "text" : type}
          {...register(name)}
        />

        {/* Íconos al final del input */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-event-none">
          {(name === "password" || name === "passwordConfirm") &&
            <>
              {!showPassword && (
                <AiOutlineEye
                  className="w-6 h-6 text-sm text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
              {showPassword && (
                <AiOutlineEyeInvisible
                  className="w-6 h-6 text-sm text-gray-600 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              )}
            </>
          }
          {isInvalid && (
            <RiErrorWarningFill className="w-6 h-6 text-sm text-red-700" />
          )}
        </div>
      </div>

      {isInvalid &&
        <p className="-mt-3 text-xs font-bold text-red-700">
          {`${errors[name]?.message}`}
        </p>
      }
    </>
  )
};

export default Input;