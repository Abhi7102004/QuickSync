import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACT_INFO,
} from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { Button } from "@mui/material";
import MultipleSelector from "@/components/ui/multi-select";
const CreateChannel = () => {
  const [newChannelModel, setNewChannelModel] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const { setSelectedChatType, setSelectedChatData,addChannel } = useAppStore();

  useEffect(() => {
    const getData = async () => {
      const response = await apiClient.get(GET_ALL_CONTACT_INFO, {
        withCredentials: true,
      });
      setAllContacts(response.data.contacts);
    };
    getData();
  }, [setAllContacts]);

  const createChannel = async () => {
    try {
      if (channelName.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName,
            members: selectedContacts.map((contact) => contact.value),
          },
          { withCredentials: true }
        );
        // console.log(response.data)
        if(response.status===200){
            addChannel(response.data.newChannel)
            setChannelName('');
            setSelectedContacts([]);
            setNewChannelModel(false);
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            onClick={() => setNewChannelModel(true)}
            className="text-neutral-400 font-light hover:text-neutral-100 transition-all cursor-pointer"
          />
        </TooltipTrigger>
        <TooltipContent className="border-none rounded-md mb-2 lg:mr-10 md:mr-6 mr-0">
          <p className="text-neutral-400 font-normal text-sm">
            Create New Channel
          </p>
        </TooltipContent>
      </Tooltip>
      <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
        <DialogContent className="bg-gray-800 border-none text-white max-w-[90%] w-full sm:max-w-sm md:max-w-md lg:max-w-lg h-auto p-4 md:p-6 rounded-[10px] shadow-lg transform transition-all mx-auto my-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-center">
              Please fill details for new channel
            </DialogTitle>
          </DialogHeader>

          <div>
            <Input
              onChange={(e) => setChannelName(e.target.value)}
              className="rounded-xl bg-[#2c2e3b] border-none w-full py-2 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter Channel Name"
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              placeholder="Search Contacts"
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              value={selectedContacts}
              onChange={setSelectedContacts} 
              emptyIndicator={
                <p className="text-center text-lg  leading-10 text-gray-600">
                  No result found
                </p>
              }
            />
          </div>
          <Button
            onClick={createChannel}
            className="w-full text-white transition-all duration-300"
          >
            Create Channel
          </Button>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default CreateChannel;
