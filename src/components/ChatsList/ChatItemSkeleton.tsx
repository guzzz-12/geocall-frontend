const ChatItemSkeleton = () => {
  return (
    <div className="flex justify-start items-center gap-2 w-full h-[60px] shrink-0 px-2 py-2 border-b border-gray-200 animate-pulse">
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-400"/>
      <div className="flex-grow max-w-[full] h-5 bg-gray-400" />
    </div>
  )
};

export default ChatItemSkeleton;