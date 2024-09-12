import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import React, { createContext, useContext, useRef, useEffect } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo, addMessage } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo._id },
      });

      socket.current.on("connect", () => {
        console.log(`Connected to Socket Server`);
      });

      const handleRecieveMessage = (message) => {
        const { selectedChatType, selectedChatData } = useAppStore.getState(); 
        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          addMessage(message);
        }
      };

      socket.current.on("recieveMessage", handleRecieveMessage);

      return () => {
        // socket.current.off("recieveMessage", handleRecieveMessage);
        socket.current.disconnect();
      };
    }
  }, [userInfo, addMessage]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
