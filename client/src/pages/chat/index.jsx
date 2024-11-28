import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { useEffect } from "react";
import { Upload, Download } from "lucide-react";
import ContactContainer from "./ContactContainer";
import ChatContainer from "./ChatContainer";
import EmptyContainer from "./EmptyContainer";

const Chat = () => {
  const {
    userInfo,
    setUserInfo,
    selectedChatType,
    selectedChatData,
    isUploading,
    isDownloading,
    fileUploadProgress,
    fileDownloadProgress,
  } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const ProfileUpdate = userInfo?.defaultProfile;
    const checkProfile = !!ProfileUpdate;
    if (!checkProfile) {
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  const Loader = ({ progress, text, icon: Icon }) => (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <Icon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
        <h5 className="text-2xl font-semibold mb-4 text-white">{text}</h5>
        <div className="w-64 h-2 bg-gray-700 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg text-white">{progress}%</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen text-white bg-violet-900 overflow-hidden">
      {isUploading && <Loader progress={fileUploadProgress} text="Sending File" icon={Upload} />}
      {isDownloading && <Loader progress={fileDownloadProgress} text="Downloading File" icon={Download} />}
      <ContactContainer />
      {selectedChatType === undefined ? <EmptyContainer /> : <ChatContainer />}
    </div>
  );
};

export default Chat;