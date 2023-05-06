import { Link } from "react-router-dom";

interface Props {
  size: "sm" | "md" | "lg";
};

const Logo = ({size="sm"}: Props) => {
  const dimensions = {
    img: 0,
    text: 0
  };

  switch(size) {
    case "sm":
      dimensions.img = 44;
      dimensions.text = 18;
      break;
    case "md":
      dimensions.img = 75;
      dimensions.text = 30;
      break;
    case "lg":
      dimensions.img = 90;
      dimensions.text = 48;
      break;
    
  }

  return (
    <Link to="/" className="flex justify-start items-center gap-1">
      <img
        style={{width: dimensions.img, height: dimensions.img}}
        className="block"
        src="/world-map.png"
        alt="World map icon"
      />
      <h1
        style={{fontSize: dimensions.text}}
        className="font-bold text-gray-600"
      >
        Geo<span className="text-orange-600">Call</span>
      </h1>
    </Link>
  )
};

export default Logo;