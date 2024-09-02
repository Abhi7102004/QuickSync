import Logo from "@/assets/logo";
import { AnimationDefaultOption } from "@/utils/constants";
import React from "react";
import Lottie from "react-lottie";

const EmptyContainer = () => {
  return (
    <div className="flex-1 md:bg-gray-900 md:flex flex-col items-center justify-center hidden duration-1000 transition-all ">
      <Lottie
        isClickToPauseDisabled={true}
        height={200}
        width={200}
        options={AnimationDefaultOption}
      />
      <div className="text-opacity-90 mt-5 flex flex-col gap-5 justify-center items-center text-white lg:text-4xl text-3xl duration-300 transition-all text-center">
        <p className="font-bold text-shadow-lg">
          <span className="text-yellow-400">Hi</span> ~{" "}
          <span className="text-pink-400">Welcome</span> to{" "}
          <span className="text-green-400">My</span>{" "}
          <span className="text-orange-400 lg:text-5xl text-4xl animate-pulse">QuickSync</span>{" "}
          <span className="text-teal-300">Chat</span>
          <span className="text-red-400">App</span>
        </p>
        <p className="text-lg lg:text-xl text-shadow-md">
          <span className="text-yellow-300">Explore</span> the{" "}
          <span className="text-red-400">world</span> of{" "}
          <span className="text-blue-400">communication</span> with{" "}
          <span className="text-teal-300">ease</span>!
        </p>
      </div>
    </div>
  );
};

export default EmptyContainer;
