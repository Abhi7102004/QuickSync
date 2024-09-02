import React from "react";
import ChatHeaderContainer from "./ChatHeaderContainer";
import MessageContainer from "./MessageContainer";
import MessageBar from "./MessageBar";

const ChatContainer = () => {
  return (
    <div className="fixed top-0 h-[100vh] w-[100vw] flex flex-col bg-gray-900 md:static md:flex-1 ">
      <ChatHeaderContainer />
      <MessageContainer />
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
