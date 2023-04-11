import { CgSpinner } from "react-icons/cg";

interface Props {
  size: "small" | "medium" | "large";
};

const Spinner = ({size}: Props) => {
  let dimensions: {w: number, h: number} = {
    w: 0,
    h: 0
  };

  switch(size) {
    case "small": {
      dimensions = {w: 25, h: 25};
      break;
    };
    case "medium": {
      dimensions = {w: 40, h: 40};
      break;
    };
    case "large": {
      dimensions = {w: 60, h: 60};
      break;
    };
    default:
      dimensions = {w: 40, h: 40};
  };

  return (
    <div className="absolute top-0 left-0 flex flex-col justify-center items-center w-full h-full bg-white">
      <CgSpinner
        style={{width: dimensions.w, height: dimensions.h}}
        className="text-blue-500 animate-spin"
      />
    </div>
  )
};

export default Spinner;