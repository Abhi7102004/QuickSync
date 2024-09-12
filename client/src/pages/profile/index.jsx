import React, { useState, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import {
  colors,
  getColor,
  UPDATE_PROFILE,
  DELETE_PROFILE_IMAGE,
  UPDATE_PROFILE_IMAGE,
} from "@/utils/constants";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile fields state
  const [firstName, setFirstName] = useState(userInfo?.firstName || "");
  const [lastName, setLastName] = useState(userInfo?.lastName || "");
  const [color, setColor] = useState(userInfo?.color || 0);
  const { image, setImage } = useState(userInfo?.color|| "");

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      // console.log('File Uploaded',response.data.secure_url)
      return response.data.secure_url;
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      toast.error("Image upload failed");
      return null;
    }
  };

  // Update Profile Picture using Cloudinary
  const updateProfilePicture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // console.log('File input changed');
    const imageUrl = await uploadImageToCloudinary(file);
    if (!imageUrl) return;

    try {
      // Update the user profile with the new image URL
      const response = await apiClient.post(
        UPDATE_PROFILE_IMAGE,
        { imageUrl },
        { withCredentials: true }
      );
      // console.log(response)
      if (response.status === 200 && response.data.image) {
        setUserInfo({ ...userInfo, image: imageUrl });
        setImage(imageUrl);
        toast.success("Image updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update profile picture");
    }
  };
  // console.log(userInfo)
  const deleteProfilePicture = async () => {
    try {
      const response = await apiClient.delete(DELETE_PROFILE_IMAGE, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: "" });
        setImage("");
        fileInputRef.current.value = null;
        toast.success("Profile picture deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting profile picture:", err.message);
      toast.error("Failed to delete profile picture");
    }
  };

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required");
      return false;
    }
    if (color < 0) {
      toast.error("Color is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Handle submit triggered');
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE,
          { firstName, lastName, color },
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          setUserInfo({ ...userInfo, ...response.data });
          toast.success("Profile Updated Successfully");
          navigate("/chat");
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  const handleBackButton = () => {
    if (!userInfo.defaultProfile) toast.error("Please set up your profile");
    else navigate("/chat");
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500 text-gray-900 p-4 sm:p-6">
      <div className="flex w-full rounded-xl flex-col gap-6 sm:gap-8 lg:w-2/3 xl:w-1/2 bg-white shadow-lg p-6 sm:p-8 ">
        <div
          onClick={handleBackButton}
          className="flex items-center justify-center w-12 h-12 bg-indigo-500 hover:bg-indigo-600 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          <IoArrowBack className="text-white w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 xl:h-56 xl:w-56 flex items-center justify-center mx-auto border-4 border-indigo-500 rounded-full bg-gray-200"
          >
            <Avatar className="w-full h-full rounded-full overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105">
              {userInfo.image ? (
                <AvatarImage
                  className="object-cover h-full w-full"
                  src={userInfo.image}
                  alt="Profile Image"
                />
              ) : (
                <div
                  className={`flex items-center justify-center h-full w-full rounded-full text-4xl font-bold border-4 ${getColor(
                    color
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                onClick={userInfo.image ? deleteProfilePicture : handleFileClick}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 ring-indigo-500"
              >
                {image ? (
                  <FaTrash className="cursor-pointer text-3xl text-white hover:text-indigo-300" />
                ) : (
                  <FaPlus className="cursor-pointer text-3xl text-white hover:text-indigo-300" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              name="profile-image"
              className="hidden"
              onChange={updateProfilePicture}
              accept=".png, .jpeg, .svg, .webp, .jpg"
            />
          </div>
          <div className="flex flex-col gap-4 sm:gap-5 items-center w-full">
            <div className="w-full">
              <Input
                type="email"
                id="email"
                className="rounded-xl px-4 py-5 border border-gray-300 bg-gray-100 placeholder-gray-500 text-gray-900 transition-colors duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your email"
                value={userInfo.email}
                readOnly
              />
            </div>
            <div className="w-full">
              <Input
                type="text"
                id="firstName"
                className="rounded-xl px-4 py-5 border border-gray-300 bg-gray-100 placeholder-gray-500 text-gray-900 transition-colors duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="w-full">
              <Input
                type="text"
                id="lastName"
                className="rounded-xl px-4 py-5 border border-gray-300 bg-gray-100 placeholder-gray-500 text-gray-900 transition-colors duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter your Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="w-full flex justify-evenly gap-2 mt-4 lg:justify-between items-center">
              {colors.map((c, index) => (
                <div
                  key={index}
                  className={`rounded-full h-10 w-10 aspect-square cursor-pointer transition-transform duration-300 transform hover:scale-110 ${c} ${
                    color === index
                      ? "outline outline-indigo-500 outline-4 shadow-md"
                      : ""
                  }`}
                  onClick={() => setColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={handleSubmit}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
