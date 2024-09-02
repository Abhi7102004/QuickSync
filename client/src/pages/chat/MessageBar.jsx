import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const { selectedChatType, selectedChatData, userInfo } = useAppStore();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef(null);
  const socket = useSocket();

  const handleAddEmoji = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    // console.log(userInfo)
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo._id,
        recipient: selectedChatData._id,
        content: message,
        messageType: "text",
        file: undefined,
      });
      setMessage("");  // Clear the message input after sending
    }
  };

  return (
    <div className="h-[10vh] bg-gray-900 flex justify-center items-center px-4 gap-2">
      <div className="flex-1 flex bg-gray-950 rounded-xl items-center px-4 py-2 max-w-[90%]">
        <input
          type="text"
          className="flex-1 bg-transparent px-2 py-1 rounded-full text-white placeholder-neutral-500 focus:border-none focus:outline-none"
          placeholder="Enter your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="focus:border-none text-neutral-500 focus:outline-none focus:text-white duration-300 transition-all">
            <GrAttachment className="text-xl" />
          </button>
          <div className="relative">
            <button
              className="focus:border-none text-neutral-500 focus:outline-none focus:text-white duration-300 transition-all"
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            >
              <RiEmojiStickerLine className="text-xl" />
            </button>
            {emojiPickerOpen && (
              <div className="absolute bottom-12 right-0 z-10" ref={emojiRef}>
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={handleAddEmoji}
                  autoFocusSearch={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        className="focus:border-none bg-[#8417ff] rounded-full flex items-center justify-center p-3 hover:bg-purple-600 focus:bg-purple-600 text-neutral-500 focus:outline-none focus:text-white duration-300 transition-all flex-shrink-0"
        onClick={handleSendMessage}
      >
        <IoSend className="text-xl text-white" />
      </button>
    </div>
  );
};

export default MessageBar;
