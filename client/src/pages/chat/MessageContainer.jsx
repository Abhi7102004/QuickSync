import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_MESSAGES_ROUTE } from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import emojiRegex from "emoji-regex";

const MessageContainer = () => {
  const scrollRef = useRef(null);
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useAppStore();

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { _id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.allMessages) {
          setSelectedChatMessages(response.data.allMessages);
        }
      } catch (err) {
        console.error("Error in fetching messages", err.message);
      }
    };

    if (selectedChatData._id && selectedChatType === "contact") {
      getMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const isSingleEmoji = (content) => {
    const regex = emojiRegex();
    const emojis = content.match(regex);
    return emojis && emojis.length === 1 && emojis[0].length === content.length;
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      
      const isSingleEmojiFlag = isSingleEmoji(message.content.trim());
      return (
        <div key={message._id}>
          {showDate && (
            <div className="text-center text-gray-400 my-2">
              {moment(message.timeStamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" &&
            renderDMMessages(message, isSingleEmojiFlag)}
        </div>
      );
    });
  };

  const renderDMMessages = (message, isSingleEmoji) => (
    <Box
      className={`flex ${
        message.sender !== selectedChatData._id
          ? "justify-end"
          : "justify-start"
      } my-1`}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end", 
          maxWidth: "60%",
          backgroundColor:
            message.sender !== selectedChatData._id
              ? "rgb(98, 0, 238, 0.85)"
              : "rgb(55, 65, 81, 0.85)",
          color: "#fff",
          borderRadius: "14px",
          padding: "10px 10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
          overflowWrap: "break-word",
        }}
      >
        <Typography
          sx={{
            fontSize: isSingleEmoji ? "2.5rem" : "1rem",
            lineHeight: isSingleEmoji ? "1" : "1.5",
          }}
        >
          {message.content}
        </Typography>
        <div
          style={{
            marginLeft: "4px", 
            fontSize: "12px",
            color: "#fff",
            alignSelf: "flex-end", 
          }}
        >
          {moment(message.timeStamp).format("HH:mm")}
        </div>
      </Box>
    </Box>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 px-8 bg-gray-900 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageContainer;
