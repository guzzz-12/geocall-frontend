import Picker from "@emoji-mart/react";
import facebookEmojisData from "@emoji-mart/data/sets/14/facebook.json";

interface Props {
  pickEmojiHandler: (emoji: any) => void;
};

const EmojiPicker = ({pickEmojiHandler}: Props) => {
  return (
    <div className="absolute bottom-[120px] right-[24px] w-max h-auto z-30000000">
      <Picker
        data={facebookEmojisData}
        set="facebook"
        theme="dark"
        onEmojiSelect={(emoji: any) => pickEmojiHandler(emoji)}
      />
    </div>
  )
};

export default EmojiPicker;