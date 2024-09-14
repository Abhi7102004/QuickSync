import { useAppStore } from '@/store';
import React from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { getColor } from '@/utils/constants';

const ChatHeaderContainer = () => {
  const { closeChat, selectedChatData, userInfo, selectedChatType } = useAppStore();

  return (
    <div className="h-16 bg-gray-900 border-b-2 border-gray-700 flex justify-center items-center px-4">
      <div className="w-full max-w-[95%] flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedChatType === 'contact' ? (
            <>
              {/* Avatar and contact details for 'contact' type */}
              <div className="relative w-12 h-12">
                <Avatar className="w-full h-full rounded-full overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105">
                  {selectedChatData?.image ? (
                    <AvatarImage
                      className="object-cover h-full w-full rounded-full"
                      src={selectedChatData.image}
                      alt="Profile Image"
                    />
                  ) : (
                    <div
                      className={`uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold border-4 ${getColor(
                        selectedChatData?.color || 'bg-gray-500'
                      )}`}
                    >
                      {selectedChatData?.firstName
                        ? selectedChatData.firstName.charAt(0)
                        : selectedChatData?.email?.charAt(0) || 'N/A'}
                    </div>
                  )}
                </Avatar>
              </div>
              <div className="text-white text-lg font-semibold">
                {selectedChatData?.firstName && selectedChatData?.lastName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData?.email || 'No Name'}
              </div>
            </>
          ) : (
            <>
              {/* Channel details for 'channel' type */}
              <div className="relative w-12 h-12">
                <div className="uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold bg-gray-700 text-white">
                  {selectedChatData?.name?.charAt(0) || '#'}
                </div>
              </div>
              <div className="text-white text-lg font-semibold">
                {selectedChatData?.name || 'Unnamed Channel'}
              </div>
            </>
          )}
        </div>
        <button
          onClick={closeChat}
          className="flex items-center focus:outline-none focus:ring-0 hover:text-red-500 text-neutral-500 transition-all duration-300"
        >
          <RiCloseFill className="text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeaderContainer;
