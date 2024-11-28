import React, { useState } from "react";
import { useAppStore } from "@/store";
import { useWebRTC } from "@/context/WebRTCContext";
import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";
import ProfileModal from "./ProfileModal";
import { motion } from "framer-motion";
import { Call, VideoCall } from "@mui/icons-material";
import { toast } from "sonner";

const ChatHeaderContainer = () => {
  const { closeChat, selectedChatData, onlineUsers, selectedChatType } =
    useAppStore();
  const { initiateCall } = useWebRTC();
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);
  const isChannel = selectedChatType === "channel";
  const isOnline = onlineUsers?.has(selectedChatData?._id);

  const handleCallInitiate = async (callType) => {
    if (isChannel) {
      toast.error("Cannot initiate calls in channels");
      return;
    }

    if (!isOnline) {
      toast.error("User is offline");
      return;
    }

    if (!selectedChatData?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      // console.log(selectedChatData)
      await initiateCall(selectedChatData._id, callType);
    } catch (error) {
      console.error("Failed to initiate call:", error);
      toast.error("Failed to initiate call. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-20 bg-gray-800/65 backdrop-blur-sm border-b border-gray-600/50 flex justify-center items-center px-4 shadow-lg"
      >
        <div className="w-full max-w-[95%] flex items-center justify-between">
          {/* Profile Section */}
          <motion.div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={openProfileModal}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12"
              >
                <Avatar className="w-full h-full rounded-full overflow-hidden transition-colors duration-200">
                  {selectedChatData?.image ? (
                    <AvatarImage
                      className="object-cover h-full w-full rounded-full"
                      src={selectedChatData.image}
                      alt="Profile Image"
                    />
                  ) : (
                    <div
                      className={`uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold ${getColor(
                        selectedChatData?.color || "bg-gray-500"
                      )}`}
                    >
                      {isChannel
                        ? selectedChatData?.name?.charAt(0) || "#"
                        : `${selectedChatData?.firstName?.charAt(0) || "#"}${
                            selectedChatData?.lastName?.charAt(0) || ""
                          }`}
                    </div>
                  )}
                </Avatar>
              </motion.div>

              {/* Online Status Indicator */}
              {!isChannel && (
                <motion.div
                  initial={false}
                  animate={{
                    scale: isOnline ? [1, 1.2, 1] : 1,
                    backgroundColor: isOnline ? "#4ade80" : "#6b7280",
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isOnline ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                  className="absolute -bottom-0 -right-1 w-4 h-4 rounded-full border-2 border-gray-800"
                />
              )}
            </div>

            {/* Name and Status */}
            <div className="flex flex-col">
              <motion.div className="text-white text-lg font-semibold group-hover:text-gray-300 transition-colors duration-200">
                {isChannel
                  ? selectedChatData?.name || "Unnamed Channel"
                  : `${selectedChatData?.firstName || "Unknown"} ${
                      selectedChatData?.lastName || ""
                    }`}
              </motion.div>

              {!isChannel && (
                <motion.span
                  initial={false}
                  animate={{
                    color: isOnline ? "#86efac" : "#9ca3af",
                    y: isOnline ? [0, -2, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: isOnline ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                  className="text-sm font-medium"
                >
                  {isOnline ? "online" : "offline"}
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="flex items-center justify-between gap-4 text-gray-500">
            {/* Voice Call Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
                rotate: 15,
                boxShadow: "0px 5px 15px rgba(0, 128, 0, 0.3)",
              }}
              whileTap={{
                scale: 0.9,
                rotate: -10,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`border ${
                isChannel || !isOnline
                  ? "border-gray-500 cursor-not-allowed opacity-50"
                  : "border-green-400 hover:border-green-500"
              } p-2 rounded-full focus:outline-none`}
              onClick={() => handleCallInitiate("audio")}
              disabled={isChannel || !isOnline}
              title={
                isChannel
                  ? "Calls are not available in channels"
                  : !isOnline
                  ? "User is offline"
                  : "Start voice call"
              }
            >
              <Call
                className={isChannel || !isOnline ? "text-gray-500" : "text-green-400"}
              />
            </motion.button>

            {/* Video Call Button */}
            <motion.button
              whileHover={{
                scale: 1.05,
                rotate: 15,
                boxShadow: "0px 5px 15px rgba(0, 128, 0, 0.3)",
              }}
              whileTap={{
                scale: 0.9,
                rotate: -10,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`border ${
                isChannel || !isOnline
                  ? "border-gray-500 cursor-not-allowed opacity-50"
                  : "border-green-400 hover:border-green-500"
              } p-2 rounded-full focus:outline-none`}
              onClick={() => handleCallInitiate("video")}
              disabled={isChannel || !isOnline}
              title={
                isChannel
                  ? "Calls are not available in channels"
                  : !isOnline
                  ? "User is offline"
                  : "Start video call"
              }
            >
              <VideoCall
                className={isChannel || !isOnline ? "text-gray-500" : "text-green-400"}
              />
            </motion.button>

            {/* Close Chat Button */}
            <motion.button
              onClick={closeChat}
              whileHover={{
                scale: 1.05,
                rotate: 15,
                boxShadow: "0px 5px 15px rgba(255, 0, 0, 0.3)",
              }}
              whileTap={{
                scale: 0.9,
                rotate: -10,
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="border-2 border-red-600 p-2 rounded-full hover:border-red-700 focus:outline-none"
              title="Close chat"
            >
              <RiCloseFill className="text-2xl text-red-600" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        selectedChatData={selectedChatData}
        isChannel={isChannel}
      />
      
    </>
  );
};

export default ChatHeaderContainer;