import { ReactNode } from "react"

interface Props {
  children: ReactNode;
};

const FormsWrapper = ({children}: Props) => {
  return (
    <section className="flex flex-col justify-start items-center w-full h-screen py-10">
      {children}
    </section>
  )
};

export default FormsWrapper;