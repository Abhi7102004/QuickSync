import Logo from "@/assets/logo";
import React, { useEffect } from "react";
import Title from "./Title";
import ProfileInfo from "./ProfileInfo";
import NewDm from "./NewDm";
import { apiClient } from "@/lib/api-client";
import {
  GET_ALL_CONTACT_DMLIST,
  GET_USER_CHANNELS_ROUTE,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "./ContactList";
import CreateChannel from "./CreateChannel";

const ContactContainer = () => {
  const { setSelectedContacts, selectedContacts, channels, setChannels } =
    useAppStore();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACT_DMLIST, {
          withCredentials: true,
        });
        // console.log(response)
        if (response?.data.contacts) {
          setSelectedContacts(response.data.contacts);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    const getUserChannels = async () => {
      try {
        const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {
          withCredentials: true,
        });
        // console.log(response);
        if (response?.data.channels) {
          setChannels(response.data.channels);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    getContacts();
    getUserChannels();
  }, [setSelectedContacts, setChannels]);
  return (
    <div className="relative md:w-[35vw] lg:[30vw] xl:[20vw] bg-gray-900 border-r-2 border-gray-700 w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex justify-between items-center pr-12">
          <Title text={"Direct Messages"} />
          <NewDm />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={selectedContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex justify-between items-center pr-12">
          <Title text={"Channels"} />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactContainer;
