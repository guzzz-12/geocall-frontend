import { IconType } from "react-icons/lib";

interface Props {
  name: string;
  link?: string;
  size?: "sm" | "md" | "lg";
  Icon: IconType;
};

const SocialLink = ({name, link, Icon, size="md"}: Props) => {
  return (
    <div
      style={{
        gap: size === "sm" ? 4 : "md" ? 8 : 12,
        fontSize: size === "sm" ? 14 : "md" ? 16 : 20
      }}
      className="flex justify-start items-center"
    >
      <Icon style={{width: size === "sm" ? 14 : "md" ? 24 : 28}}/>
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