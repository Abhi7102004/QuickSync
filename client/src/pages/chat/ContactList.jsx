import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";
import { useAppStore } from "@/store";

const ContactList = ({ contacts=[], isChannel = false }) => {
  const {
    setSelectedChatData,
    selectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClickContact = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };
  return (
    <div className="mt-5">
      {contacts.length &&
        contacts.map((contact) => (
          <div
            key={contact._id}
            className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
              selectedChatData && selectedChatData._id === contact._id
                ? "bg-violet-600"
                : "bg-[#f1f1f111]"
            } `}
            onClick={() => handleClickContact(contact)}
          >
            <div className="flex gap-5 justify-start items-center text-neutral-300">
              {!isChannel && (
                <Avatar className="h-10 w-10 overflow-hidden rounded-full">
                  {contact.image ? (
                    <AvatarImage
                      className="object-cover h-full w-full rounded-full"
                      src={contact.image}
                      alt={`${contact.firstName} ${contact.lastName}`}
                    />
                  ) : (
                    <div
                      className={`uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold border-4 ${getColor(
                        contact.color
                      )}`}
                    >
                      {contact?.firstName
                        ? contact.firstName.charAt(0)
                        : contact?.email.charAt(0)}
                    </div>
                  )}
                </Avatar>
              )}
              <div className="text-white">
                {contact?.firstName && contact?.lastName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact?.email}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ContactList;
