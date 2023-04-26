interface Props {
  text: string;
};

const SectionTitle = ({text}: Props) => {
  return (
    <h1 className="text-2xl text-center text-gray-600 font-bold uppercase">
      {text}
    </h1>
  )
};

export default SectionTitle;