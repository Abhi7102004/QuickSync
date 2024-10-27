import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILES } from "@/utils/constants";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const [message, setMessage] = useState("");
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setFileUploadProgress,
    setIsUploading,
  } = useAppStore();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef(null);
  const socket = useSocket();
  const fileInputRef = useRef();
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
    const isMessageOnlyWhitespace = !/\S/.test(message);

    if (isMessageOnlyWhitespace) {
      return;
    }

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo._id,
        recipient: selectedChatData._id,
        content: message,
        messageType: "text",
        file: undefined,
      });
      setMessage("");
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo._id,
        content: message,
        messageType: "text",
        file: undefined,
        channelId: selectedChatData._id,
      });
      setMessage("");
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const uploadFileToCloudinary = async (file) => {
    setIsUploading(true);
    let formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_FILE_UPLOAD_PRESET
    );

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/raw/upload`,
        formData,
        {
          onUploadProgress: (data) => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          },
        }
      );
      return response.data.secure_url;
    } catch (e) {
      console.log(e.message, "File Not Found");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentChange = async (e) => {
    const file = e.target.files[0];
    try {
      const attachmentUrl = await uploadFileToCloudinary(file);
      if (attachmentUrl.length > 0) {
        if (selectedChatType === "contact") {
          socket.emit("sendMessage", {
            sender: userInfo._id,
            recipient: selectedChatData._id,
            content: undefined,
            messageType: "file",
            file: attachmentUrl,
          });
        } else if (selectedChatType === "channel") {
          socket.emit("send-channel-message", {
            sender: userInfo._id,
            content: undefined,
            messageType: "file",
            file: attachmentUrl,
            channelId: selectedChatData._id,
          });
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
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
          onKeyDown={handleKeyPress}
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAttachmentClick}
            className="focus:border-none text-neutral-500 focus:outline-none focus:text-white duration-300 transition-all"
          >
            <GrAttachment className="text-xl" />
          </button>
          <input
            ref={fileInputRef}
            onChange={handleAttachmentChange}
            className="hidden"
            type="file"
          ></input>
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
