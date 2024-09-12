import Logo from "@/assets/logo";
import React, { useEffect } from "react";
import Title from "./Title";
import ProfileInfo from "./ProfileInfo";
import NewDm from "./NewDm";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_CONTACT_DMLIST } from "@/utils/constants";
import { useAppStore } from "@/store";
import ContactList from "./ContactList";

const ContactContainer = () => {
  const { setSelectedContacts, selectedContacts } = useAppStore();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const response = await apiClient.get(
          GET_ALL_CONTACT_DMLIST,
          {
            withCredentials: true,
          }
        );
        if(response.data){
          setSelectedContacts(response.data);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    getContacts();
  }, [setSelectedContacts]);
  // console.log(selectedContacts)
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
      </div>
      <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
        <ContactList contacts={selectedContacts.contacts} />
      </div>
      <div className="my-5">
        <div className="flex justify-between items-center pr-12">
          <Title text={"Channels"} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
};

export default ContactContainer;
