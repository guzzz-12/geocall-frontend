import { ReactNode } from "react"

interface Props {
  children: ReactNode;
};

const FormsWrapper = ({children}: Props) => {
  return (
    <section className="flex flex-col justify-start items-center w-full min-h-screen py-5">
      {children}
    </section>
  )
};

export default FormsWrapper;