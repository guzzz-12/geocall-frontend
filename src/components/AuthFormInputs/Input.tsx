import {useState, useEffect, ElementType } from "react";
import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineEye, AiOutlineEyeInvisible, AiFillCheckCircle } from "react-icons/ai";
import { RiErrorWarningFill } from "react-icons/ri";

interface Props {
  id: string;
  name: string;
  type: "text" | "email" | "password" | "number";
  placeholder: string;
  disabled: boolean;
  Icon: ElementType;
};

const Input = ({id, name, type, placeholder, disabled, Icon}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFieldValidated, setIsFieldValidated] = useState(false);

  const {register, watch, formState: {errors, isSubmitted}} = useFormContext();

  const isInvalid = !!errors[name];
  const fieldValue = watch(name);
  
  // Verificar si el campo es válido
  // El mecanismo de verificación toma en cuenta
  // si el campo es inválido y si ya se intentó
  // enviar el formulario
  useEffect(() => {
    const isValid = !isInvalid && isSubmitted;
    setIsFieldValidated(isValid);
  }, [isInvalid, name, fieldValue, isSubmitted]);

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
          {(name === "password" || name === "passwordConfirm" || name === "newPassword") &&
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
          
          {/* ícono para indicar error de validación */}
          {isInvalid && (
            <motion.div
              key="invalidIcon"
              className="origin-center"
              initial={{scale: 0, opacity: 0, rotateZ: 180}}
              animate={{scale: 1, opacity: 1, rotateZ: 0}}
              exit={{scale: 0, opacity: 0, rotateZ: 180}}
            >
              <RiErrorWarningFill
                className="w-6 h-6 text-sm text-red-700"
              />
            </motion.div>
          )}
          
          {/* Ícono para indicar que el campo es válido */}
          {isFieldValidated &&
            <motion.div
              key="validatedIcon"
              className="origin-center"
              initial={{scale: 0, opacity: 0, rotateZ: 180}}
              animate={{scale: 1, opacity: 1, rotateZ: 0}}
              exit={{scale: 0, opacity: 0, rotateZ: 180}}
            >
            <AiFillCheckCircle
              className="w-6 h-6 text-sm text-green-500"
            />
          </motion.div>
          }
        </div>
      </div>
      
      {/* Mensaje de error de validación */}
      <AnimatePresence>
        {isInvalid &&
          <motion.p
            key="validationErrorMessage"
            className="-mt-3 text-xs font-bold text-red-700"
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
          >
            {`${errors[name]?.message}`}
          </motion.p>
        }
      </AnimatePresence>
    </>
  )
};

export default Input;