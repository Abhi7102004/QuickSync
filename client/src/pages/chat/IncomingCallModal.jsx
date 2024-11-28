import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";

const IncomingCallModal = ({
  isOpen,
  caller,
  callType,
  onAccept,
  onReject,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
            className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center gap-4 w-full max-w-lg"
          >
            <div className="text-xl font-semibold text-white mb-2">
              Incoming {callType} Call
            </div>
            <Avatar className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600">
              {caller?.image ? (
                <AvatarImage
                  src={caller.image}
                  alt={`${caller?.firstName} ${caller?.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white ${getColor(
                    caller?.color || "bg-gray-500"
                  )}`}
                >
                  {`${caller?.firstName?.[0] || "#"}${
                    caller?.lastName?.[0] || ""
                  }`}
                </div>
              )}
            </Avatar>
            <div className="text-lg text-white">
              {caller?.firstName} {caller?.lastName}
            </div>
            <div className="flex gap-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onReject}
                className="bg-red-500 p-3 rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="bg-green-500 p-3 rounded-full hover:bg-green-600 transition-colors"
              >
                <Phone className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallModal;