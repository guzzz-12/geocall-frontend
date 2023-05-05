import { ReactNode } from "react";
import SectionTitle from "./SectionTitle";

interface Props {
  children: ReactNode;
  sectionTitle?: string;
};

const ContentWrapper = ({children, sectionTitle}: Props) => {
  return (
    <article className="flex flex-col justify-start items-center gap-6 w-full h-full pt-5 px-2 pb-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
      {sectionTitle && <SectionTitle text={sectionTitle} />}
      {children}
    </article>
  )
};

export default ContentWrapper;