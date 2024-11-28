import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
const CallModal = ({ isOpen, streams, callType, onEnd, callState }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (streams?.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = streams.localStream;
      localVideoRef.current.play().catch((error) => {
        console.error("Error playing local stream:", error);
      });
    }
  }, [streams?.localStream]);

  useEffect(() => {
    if (streams?.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = streams.remoteStream;
      remoteVideoRef.current.play().catch((error) => {
        console.error("Error playing remote stream:", error);
      });
    }
  }, [streams?.remoteStream]);

  useEffect(() => {
    if (streams?.localStream) {
      const audioTracks = streams.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, streams?.localStream]);

  useEffect(() => {
    if (streams?.localStream) {
      const videoTracks = streams.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, streams?.localStream]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center"
        >
          <div className="p-6 rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 w-3/4 max-w-7xl">
            {callType === "video" && (
              <>
                <div className="relative w-full h-3/4">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full rounded-2xl object-cover"
                  />
                  <div className="absolute bottom-1 rounded-full right-1 sm:bottom-2 sm:right-2 lg:bottom-3 lg:right-3  lg:w-44 lg:h-44 md:w-36 md:h-36 sm:w-28 sm:h-28 w-20 h-20 overflow-hidden shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </>
            )}

            {callType === "audio" && (
              <div className="flex items-center justify-center h-3/4 w-full">
                <div className="text-white text-2xl">
                  {!callState.isCallAccepted
                    ? "Calling..."
                    : "Audio Call in Progress"}
                </div>
              </div>
            )}

            {!callState.isCallAccepted && (
              <div className="text-white text-lg animate-pulse">
                Waiting for answer...
              </div>
            )}

            <div className="bg-transparent p-4 rounded-xl flex justify-center items-center gap-4 w-full">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full ${
                  isMuted ? "bg-red-500" : "bg-gray-600"
                } hover:opacity-90 transition-opacity`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </motion.button>

              {callType === "video" && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full ${
                    isVideoOff ? "bg-red-500" : "bg-gray-800"
                  } hover:opacity-90 transition-opacity`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallModal;
