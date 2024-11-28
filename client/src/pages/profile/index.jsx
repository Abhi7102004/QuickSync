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
import { FaTrash, FaPlus, FaUser, FaEnvelope } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    firstName: userInfo?.firstName || "",
    lastName: userInfo?.lastName || "",
    color: userInfo?.color || 0,
    image: userInfo?.image || "",
    isHovered: false,
  });

  const handleInputChange = (field) => (e) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      toast.error("Image upload failed");
      return null;
    }
  };

  const updateProfilePicture = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const imageUrl = await uploadImageToCloudinary(file);
    if (!imageUrl) return;

    try {
      const response = await apiClient.post(
        UPDATE_PROFILE_IMAGE,
        { imageUrl },
        { withCredentials: true }
      );
      if (response.data.success) {
        setUserInfo({ ...userInfo, image: imageUrl });
        setFormState((prev) => ({ ...prev, image: imageUrl }));
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const deleteProfilePicture = async () => {
    try {
      const response = await apiClient.delete(DELETE_PROFILE_IMAGE, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUserInfo({ ...userInfo, image: "" });
        setFormState((prev) => ({ ...prev, image: "" }));
        fileInputRef.current.value = null;
        toast.success(response.data.message);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await apiClient.post(
        UPDATE_PROFILE,
        {
          firstName: formState.firstName,
          lastName: formState.lastName,
          color: formState.color,
        },
        { withCredentials: true }
      );
      if (response.data.success) {
        setUserInfo({ ...userInfo, ...response.data.user });
        toast.success("Profile Updated Successfully");
        navigate("/chat");
      }
    } catch (err) {
      console.log(err.message);
      toast.error("Failed to update profile");
    }
  };

  const handleBackButton = () => {
    if (!userInfo.defaultProfile) toast.error("Please set up your profile");
    else navigate("/chat");
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-gray-900 p-4 sm:p-6">
      <div className="flex w-full rounded-2xl flex-col gap-6 sm:gap-8 lg:w-2/3 xl:w-1/2 bg-white/95 backdrop-blur-sm shadow-2xl p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <div
            onClick={handleBackButton}
            className="flex items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-700 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          >
            <IoArrowBack className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-indigo-900">Edit Profile</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center space-y-4">
            <div
              onMouseEnter={() =>
                setFormState((prev) => ({ ...prev, isHovered: true }))
              }
              onMouseLeave={() =>
                setFormState((prev) => ({ ...prev, isHovered: false }))
              }
              className="relative h-40 w-40 lg:h-48 lg:w-48 xl:h-56 xl:w-56 group"
            >
              <Avatar className="w-full h-full rounded-full overflow-hidden shadow-xl border-indigo-500/50 transition-transform duration-300">
                {formState.image ? (
                  <AvatarImage
                    className="object-cover h-full w-full rounded-full"
                    src={formState.image}
                    alt="Profile Image"
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center h-full w-full rounded-full text-5xl font-bold ${getColor(
                      formState.color
                    )}`}
                  >
                    {formState.firstName
                      ? formState.firstName.charAt(0)
                      : userInfo.email.charAt(0)}
                  </div>
                )}
              </Avatar>
              {formState.isHovered && (
                <div
                  onClick={
                    formState.image
                      ? deleteProfilePicture
                      : () => fileInputRef.current.click()
                  }
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 cursor-pointer transition-opacity duration-300"
                >
                  {formState.image ? (
                    <FaTrash className="text-3xl text-white hover:text-red-300" />
                  ) : (
                    <FaPlus className="text-3xl text-white hover:text-green-300" />
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={updateProfilePicture}
                accept=".png, .jpeg, .svg, .webp, .jpg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <Input
                type="email"
                className="pl-10 py-6 rounded-xl border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={userInfo.email}
                readOnly
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <Input
                type="text"
                className="pl-10 py-6 rounded-xl border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="First Name"
                value={formState.firstName}
                onChange={handleInputChange("firstName")}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <Input
                type="text"
                className="pl-10 py-6 rounded-xl border-gray-300 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Last Name"
                value={formState.lastName}
                onChange={handleInputChange("lastName")}
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {colors.map((c, index) => (
                <div
                  key={index}
                  className={`rounded-full h-12 w-12 cursor-pointer transition-all duration-300 transform hover:scale-110 shadow-lg ${c} ${
                    formState.color === index
                      ? "ring-4 ring-indigo-500 ring-offset-2"
                      : ""
                  }`}
                  onClick={() =>
                    setFormState((prev) => ({ ...prev, color: index }))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            onClick={handleSubmit}
            className="px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
