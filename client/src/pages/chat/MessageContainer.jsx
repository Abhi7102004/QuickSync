import { useAppStore } from "@/store";
import moment from "moment";
import React, { useEffect, useRef } from "react";

const MessageContainer = () => {
  const scrollRef = useRef(null);
  const { selectedChatType, selectedChatData, selectedChatMessages } = useAppStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      console.log(message)
      return (
        <div key={message._id}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => (
    <div
      className={`flex ${message.sender !== selectedChatData._id ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`${
          message.sender !== selectedChatData._id
            ? "bg-purple-600/10 text-purple-200 border-purple-400/30"
            : "bg-gray-700 text-gray-300 border-gray-600"
        } border px-3 py-2 rounded my-1 max-w-[60%] break-words`}
      >
        {message.content}
      </div>
      <div className="text-xs text-gray-500 ml-2">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] bg-gray-900">
      {renderMessages()}
      <div ref={scrollRef} />
    </div>
  );
};

export default MessageContainer;
