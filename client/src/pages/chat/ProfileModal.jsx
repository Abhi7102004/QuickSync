import React from "react";
import { X, Shield, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Avatar from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";
import { useAppStore } from "@/store";

const ProfileModal = ({ isOpen, onClose, selectedChatData, isChannel }) => {
  const formatInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const renderMemberItem = (member, isAdmin = false) => (
    <motion.div
      key={member._id}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
        isAdmin 
          ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20' 
          : 'hover:bg-gray-700/30'
      }`}
    >
      <Avatar.Root className={`w-8 h-8 rounded-full overflow-hidden ${
        isAdmin ? 'ring-2 ring-purple-500' : 'ring-2 ring-purple-500/20'
      }`}>
        {member.image ? (
          <Avatar.Image
            src={member.image}
            alt={`${member.firstName || member.lastName || member.email}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center rounded-full justify-center ${getColor(
              member?.color || "bg-gray-500"
            )} text-xs`}
          >
            {isChannel 
              ? member.email?.charAt(0).toUpperCase() || "U"
              : formatInitials(member.firstName, member.lastName)}
          </div>
        )}
      </Avatar.Root>
      <div className="flex items-center gap-2 flex-1">
        <span className={`text-sm font-medium ${
          isAdmin ? 'text-purple-200' : 'text-gray-200'
        }`}>
          {isChannel 
            ? member.email
            : `${member.firstName || ''} ${member.lastName || ''}`}
        </span>
        {isAdmin && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200">
            <Crown size={12} className="text-purple-300" />
            <span className="text-xs font-medium">Channel Admin</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg mx-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-gray-900/95 border border-gray-800 shadow-2xl backdrop-blur rounded-xl p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                >
                  <Avatar.Root className="flex items-center justify-center w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-500/20 shadow-xl">
                    {selectedChatData?.image ? (
                      <Avatar.Image
                        src={selectedChatData.image}
                        alt={selectedChatData?.firstName || selectedChatData?.name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold ${getColor(
                          selectedChatData?.color || "bg-gray-500"
                        )}`}
                      >
                        {isChannel
                          ? selectedChatData?.name?.charAt(0) || "#"
                          : formatInitials(selectedChatData?.firstName, selectedChatData?.lastName)}
                      </div>
                    )}
                  </Avatar.Root>
                </motion.div>

                <div className="text-center space-y-2">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  >
                    {isChannel
                      ? selectedChatData?.name || "Unnamed Channel"
                      : `${selectedChatData?.firstName || "Unknown"} ${selectedChatData?.lastName || ""}`}
                  </motion.h2>

                  {isChannel && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200">
                        {selectedChatData?.members?.length || 0} members
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300">
                        Created {new Date(selectedChatData?.createdAt).toLocaleDateString()}
                      </span>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  {isChannel ? (
                    <div className="h-64 w-full rounded-lg bg-gray-800/50 border border-gray-700/50 shadow-inner overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-300 mb-4">
                          Channel Members
                        </h3>
                        <div className="space-y-3">
                          {/* Render admin first */}
                          {selectedChatData?.admin && renderMemberItem(selectedChatData.admin, true)}
                          
                          {/* Render other members */}
                          {selectedChatData?.members?.map((member) => 
                            member._id !== selectedChatData?.admin?._id && renderMemberItem(member)
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Email:</span>
                        <span className="text-sm text-gray-200">
                          {selectedChatData?.email || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">First Name:</span>
                        <span className="text-sm text-gray-200">
                          {selectedChatData?.firstName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Last Name:</span>
                        <span className="text-sm text-gray-200">
                          {selectedChatData?.lastName || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;