import React, { createContext, useContext, useRef, useEffect } from "react";
import io from "socket.io-client";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo, addMessage, setOnlineUsers, updateUserStatus,addChannelInChannelList,addMessageInDMList } =
    useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo._id },
      });

      socket.current.on("connect", () => {
        console.log(`Connected to Socket Server`);
      });

      const handleReceiveMessage = (message) => {
        const {
          selectedChatType,
          selectedChatData,
          addMessage,
        } = useAppStore.getState();
        if (
          selectedChatType === "contact" &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
         addMessageInDMList(message)
      };

      const handleReceiveChannelMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage } =
          useAppStore.getState();
        if (
          selectedChatType === "channel" &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }
         addChannelInChannelList(message)
      };

      // Handle online users list
      const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      // Handle individual user status update
      const handleUserStatus = ({ userId, isOnline }) => {
        updateUserStatus(userId, isOnline);
      };

      // Set up socket listeners
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("receive-channel-message", handleReceiveChannelMessage);
      socket.current.on("get-online-users", handleOnlineUsers);
      socket.current.on("user-status-update", handleUserStatus);

      // Clean up socket listeners on unmount
      return () => {
        console.log("Disconnecting socket");
        socket.current.off("receiveMessage", handleReceiveMessage);
        socket.current.off(
          "receive-channel-message",
          handleReceiveChannelMessage
        );
        socket.current.off("get-online-users", handleOnlineUsers);
        socket.current.off("user-status-update", handleUserStatus);
        socket.current.disconnect();
      };
    }
  }, [userInfo, addMessage, setOnlineUsers, updateUserStatus,addChannelInChannelList,addMessageInDMList]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
