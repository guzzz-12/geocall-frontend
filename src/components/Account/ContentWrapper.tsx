import { ReactNode } from "react";
import SectionTitle from "./SectionTitle";

interface Props {
  children: ReactNode;
  sectionTitle: string;
};

const ContentWrapper = ({children, sectionTitle}: Props) => {
  return (
    <article className="flex flex-col justify-start items-center gap-6 pt-5 pb-8 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
      <SectionTitle text={sectionTitle} />
      {children}
    </article>
  )
};

export default ContentWrapper;