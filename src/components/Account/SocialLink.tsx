import { IconType } from "react-icons/lib";

interface Props {
  name: string;
  link?: string;
  Icon: IconType;
};

const SocialLink = ({name, link, Icon}: Props) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <Icon className="w-6 h-6"/>
      {link &&
        <a
          className="text-blue-700 underline capitalize"
          href={link}
          referrerPolicy="no-referrer"
          target="_blank"
        >
          {name}
        </a>
      }
      {!link &&
        <p className="font-normal text-left text-gray-700 capitalize">
          {name}
        </p>
      }
    </div>
  )
};

export default SocialLink;