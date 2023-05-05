import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onSubmitHandler: () => Promise<void>
};

const FormWrapper = ({children, onSubmitHandler}: Props) => {
  return (
    <form
      className="flex flex-col gap-3 w-full max-w-[450px] mx-auto px-4 py-3 rounded-md bg-white shadow-md"
      noValidate
      onSubmit={onSubmitHandler}
    >
      {children}
    </form>
  )
};

export default FormWrapper;