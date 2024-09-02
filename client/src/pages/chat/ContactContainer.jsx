import Logo from "@/assets/logo";
import React from "react";
import Title from "./Title";
import ProfileInfo from "./ProfileInfo";
import NewDm from "./NewDm";

const ContactContainer = () => {
  return (
    <div className="relative md:w-[35vw] lg:[30vw] xl:[20vw] bg-gray-900 border-r-2 border-gray-700 w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex justify-between items-center pr-12">
          <Title text={"Direct Messages"} />
          <NewDm/>
        </div>
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
