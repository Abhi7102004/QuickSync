import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import {
  AnimationDefaultOption,
  SEARCH_CONTACT_ROUTE,
} from "@/utils/constants";
import Lottie from "react-lottie";
import { apiClient } from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store";

const NewDm = () => {
  const [openNewContactTable, setOpenNewContactTable] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const {
    setSelectedChatType,
    setSelectedChatData,
    onlineUsers
  } = useAppStore();

  const searchContacts = async (searchTerm) => {
    if (searchTerm.length > 0) {
      try {
        const response = await apiClient.post(
          SEARCH_CONTACT_ROUTE,
          { searchData: searchTerm },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data.contacts) {
          setSearchedContacts(response.data.contacts);
        }
      } catch (e) {
        console.log("Error occurred while searching contacts", e.message);
      }
    } else {
      setSearchedContacts([]);
    }
  };

  const selectContact = (contact) => {
    setOpenNewContactTable(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            onClick={() => setOpenNewContactTable(true)}
            className="text-neutral-400 font-light hover:text-neutral-100 transition-all cursor-pointer"
          />
        </TooltipTrigger>
        <TooltipContent className="border-none rounded-md mb-2 lg:mr-10 md:mr-6 mr-0">
          <p className="text-neutral-400 font-normal text-sm">
            Select New Contact
          </p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={openNewContactTable} onOpenChange={setOpenNewContactTable}>
        <DialogContent className="bg-gray-800 border-none text-white max-w-[90%] w-full sm:max-w-sm md:max-w-md lg:max-w-lg h-auto p-4 md:p-6 rounded-[10px] shadow-lg transform transition-all mx-auto my-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-center">
              Please Select a Contact
            </DialogTitle>
          </DialogHeader>
          <div>
            <Input
              onChange={(e) => searchContacts(e.target.value)}
              className="rounded-xl bg-[#2c2e3b] border-none w-full py-2 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Search for a Contact"
            />
            <ScrollArea className="h-[250px] mt-4">
              <div className="flex flex-col gap-5">
                {searchedContacts.length > 0 ? (
                  searchedContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition"
                      onClick={() => selectContact(contact)}
                    >
                      <div className="relative w-12 h-12">
                        <Avatar className="w-full h-full rounded-full overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105">
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
                              {contact.firstName
                                ? contact.firstName.charAt(0)
                                : contact.email.charAt(0)}
                            </div>
                          )}
                        </Avatar>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <span
                          className={`text-sm ${
                            onlineUsers?.has(contact._id)
                              ? "text-green-400"
                              : "text-gray-400"
                          }`}
                        >
                          {onlineUsers?.has(contact._id) ? "online" : "offline"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col pb-4 justify-center items-center">
                    <Lottie
                      isClickToPauseDisabled={true}
                      height={100}
                      width={100}
                      options={AnimationDefaultOption}
                    />
                    <div className="flex flex-col gap-4 justify-center items-center text-white text-center">
                      <p className="text-base md:text-lg lg:text-xl font-bold">
                        <span className="text-yellow-400">Hi</span> ~{" "}
                        <span className="text-pink-400">Search</span>{" "}
                        <span className="text-green-400">a</span>{" "}
                        <span className="text-orange-400">New Contact</span>{" "}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default NewDm;
