import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_CHANNEL_MESSAGES, GET_ALL_MESSAGES_ROUTE } from "@/utils/constants";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Modal, IconButton,Avatar } from "@mui/material";
import emojiRegex from "emoji-regex";
import CloseIcon from "@mui/icons-material/Close";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
const MessageContainer = () => {
  const scrollRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
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
        console.error("Error fetching messages:", err.message);
      }
    };
    const getChannelMessages=async ()=>{
      try{
        const response = await apiClient.get(`${GET_ALL_CHANNEL_MESSAGES}/${selectedChatData._id}`, { withCredentials: true });
        console.log(response)
        if(response.data.messages){
          setSelectedChatMessages(response.data.messages);
        }
      }catch(err){
        console.error("Error fetching channel messages:", err.message);
      }
    }
    if (selectedChatData._id && selectedChatType === "contact") {
      getMessages();
    }
    else if(selectedChatData._id && selectedChatType==='channel'){
      getChannelMessages();
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

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const extractFileName = (url) => {
    return url.split("/").pop().split(".")[0];
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message) => {
      const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={message._id}>
          {showDate && (
            <div className="text-center text-gray-400 my-2">
              {moment(message.timeStamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessage(message)}
        </div>
      );
    });
  };

  const handleDownloadFiles = async (file) => {
    // console.log(file);
    try {
      window.open(file, "_blank");
    } catch (e) {
      console.log(e.message);
    }
  };

  const renderDMMessages = (message, isSingleEmoji) => (
    <Box
      className={`flex ${
        message.sender !== selectedChatData._id
          ? "justify-end"
          : "justify-start"
      } my-2`}
    >
      {message.messageType === "text" ? (
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
      ) : checkIfImage(message.file) ? (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              message.sender !== selectedChatData._id
                ? "flex-end"
                : "flex-start",
            maxWidth: "40%",
            cursor: "pointer",
            position: "relative",
            backgroundColor:
              message.sender !== selectedChatData._id
                ? "rgb(98, 0, 238, 0.85)"
                : "rgb(55, 65, 81, 0.85)",
            borderRadius: "14px",
            padding: "10px",
          }}
          onClick={() => setSelectedImage(message.file)}
        >
          <img
            src={message.file}
            alt="file"
            className="w-72 h-72 rounded-lg shadow-md object-cover transition-transform duration-300 ease-in-out transform hover:scale-[1.02]"
          />
          <div
            className="absolute bottom-2 right-2 px-2 py-1 text-md bg-indigo-600 font-bold text-white"
            style={{ fontSize: "12px" }}
          >
            {moment(message.timeStamp).format("HH:mm")}
          </div>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            maxWidth: "60%",
            backgroundColor:
              message.sender !== selectedChatData._id
                ? "rgb(98, 0, 238, 0.85)"
                : "rgb(55, 65, 81, 0.85)",
            color: "#fff",
            borderRadius: "14px",
            padding: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
          }}
        >
          <MdFolderZip style={{ fontSize: "24px", marginRight: "8px" }} />
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: "1rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {extractFileName(message.file)}
          </Typography>
          <IconButton
            sx={{
              color: "#fff",
            }}
            onClick={() => handleDownloadFiles(message.file)}
          >
            <IoMdArrowRoundDown style={{ fontSize: "24px" }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
  const renderChannelMessage = (message) => {
    const isSender = message.sender._id === userInfo._id;
    const messageContent = message.messageType === "text" ? message.content : "";
  
    return (
      <Box className={`flex ${isSender ? "justify-end" : "justify-start"} my-2`}>
        {!isSender && (
          <Avatar
            src={message.sender.image}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            sx={{ width: 40, height: 40, marginRight: 1 }}
          />
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '60%' }}>
          {!isSender && (
            <Typography variant="caption" sx={{ color: '#9CA3AF', marginBottom: 0.5 }}>
              {`${message.sender.firstName} ${message.sender.lastName}`}
            </Typography>
          )}
          {message.messageType === "text" ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: isSender
                  ? "rgb(98, 0, 238, 0.85)"
                  : "rgb(55, 65, 81, 0.85)",
                color: "#fff",
                borderRadius: "14px",
                padding: "10px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                overflowWrap: "break-word",
              }}
            >
              <Typography
                sx={{
                  fontSize: isSingleEmoji(messageContent) ? "2.5rem" : "1rem",
                  lineHeight: isSingleEmoji(messageContent) ? "1" : "1.5",
                }}
              >
                {messageContent}
              </Typography>
              <Typography variant="caption" sx={{ alignSelf: 'flex-end', marginTop: 0.5 }}>
                {moment(message.timeStamp).format("HH:mm")}
              </Typography>
            </Box>
          ) : checkIfImage(message.file) ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                position: "relative",
                backgroundColor: isSender
                  ? "rgb(98, 0, 238, 0.85)"
                  : "rgb(55, 65, 81, 0.85)",
                borderRadius: "14px",
                padding: "10px",
              }}
              onClick={() => setSelectedImage(message.file)}
            >
              <img
                src={message.file}
                alt="file"
                className="w-72 h-72 rounded-lg shadow-md object-cover transition-transform duration-300 ease-in-out transform hover:scale-[1.02]"
              />
              <Typography variant="caption" sx={{ color: '#fff', alignSelf: 'flex-end', marginTop: 0.5 }}>
                {moment(message.timeStamp).format("HH:mm")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: isSender
                  ? "rgb(98, 0, 238, 0.85)"
                  : "rgb(55, 65, 81, 0.85)",
                color: "#fff",
                borderRadius: "14px",
                padding: "10px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
              }}
            >
              <MdFolderZip style={{ fontSize: "24px", marginRight: "8px" }} />
              <Typography
                sx={{
                  flexGrow: 1,
                  fontSize: "1rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {extractFileName(message.file)}
              </Typography>
              <IconButton
                sx={{
                  color: "#fff",
                }}
                onClick={() => handleDownloadFiles(message.file)}
              >
                <IoMdArrowRoundDown style={{ fontSize: "24px" }} />
              </IconButton>
            </Box>
          )}
        </Box>
        {isSender && (
          <Avatar
            src={message.sender.image}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            sx={{ width: 40, height: 40, marginLeft: 1 }}
          />
        )}
      </Box>
    );
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-4 px-8 bg-gray-900 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900">
      {renderMessages()}
      <div ref={scrollRef} />
      <Modal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        className="flex justify-center items-center"
      >
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: "12px",
            padding: "10px",
          }}
        >
          <IconButton
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "#fff",
              zIndex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon sx={{ fontSize: 30 }} />
          </IconButton>

          {/* Image */}
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-[40rem] max-w-[40rem]"
          />

          {/* Download Button */}
          <IconButton
            sx={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              color: "#fff",
              zIndex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            onClick={() => handleDownloadFiles(selectedImage)}
          >
            <IoMdArrowRoundDown style={{ fontSize: "30px" }} />
          </IconButton>
        </Box>
      </Modal>
    </div>
  );
};

export default MessageContainer;
