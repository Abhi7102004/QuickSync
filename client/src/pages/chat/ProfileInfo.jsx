import React, { useEffect } from "react";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { getColor, LOGOUT_ROUTE } from "@/utils/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Ensure this is the correct path
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { apiClient } from "@/lib/api-client";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      console.log(response);
      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      } else {
        console.error("Logout error");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between pl-5 pr-4 w-full bg-gray-800 z-50">
      <div className="flex gap-3 items-center justify-center">
        <div className="relative w-12 h-12">
          <Avatar className="w-full h-full rounded-full overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105">
            {userInfo?.image ? (
              <AvatarImage
                className="object-cover h-full w-full rounded-full"
                src={userInfo.image}
                alt="Profile Image"
              />
            ) : (
              <div
                className={`uppercase flex items-center justify-center h-full w-full rounded-full text-lg font-bold border-4 ${getColor(
                  userInfo.color
                )}`}
              >
                {userInfo?.firstName
                  ? userInfo.firstName.charAt(0)
                  : userInfo?.email.charAt(0)}
              </div>
            )}
          </Avatar>
        </div>
        <div className="text-white">
          {userInfo?.firstName && userInfo?.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : ""}
        </div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2
                className="text-purple-500 text-lg font-medium"
                onClick={() => navigate("/profile")}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-none text-white">
              Edit Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FontAwesomeIcon
                className="text-red-500 text-lg font-medium"
                icon={faSignOutAlt}
                onClick={handleLogout}
              />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-none text-white">
              Logout
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
