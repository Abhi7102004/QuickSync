export const HOST = import.meta.env.VITE_SERVER_URL;
export const AUTH_ROUTE = "/api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTE}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTE}/login`;
export const GET_USER_ROUTE = `${AUTH_ROUTE}/user-info`;
export const UPDATE_PROFILE = `${AUTH_ROUTE}/update-profile`;
export const UPDATE_PROFILE_IMAGE = `${AUTH_ROUTE}/update-profile-image`;
export const DELETE_PROFILE_IMAGE = `${AUTH_ROUTE}/delete-profile-image`;
export const LOGOUT_ROUTE = `${AUTH_ROUTE}/logout`;
export const CONTACT_ROUTE = "/api/contacts";
export const SEARCH_CONTACT_ROUTE = `${CONTACT_ROUTE}/search`;
export const MESSAGE_ROUTE = "/api/messages";
export const GET_ALL_MESSAGES_ROUTE = `${MESSAGE_ROUTE}/get-messages`;
export const GET_ALL_CONTACT_DMLIST = `${CONTACT_ROUTE}/get-ALL-ContactDMList`;
import animationData from "@/assets/lottie-json";
export const colors = [
  "bg-[#fff] text-[#f59e0b] border-[2px] border-[#f59e0b]", // Bright yellow-orange
  "bg-[#fde68a] text-[#e11d48] border-[2px] border-[#e11d48]", // Soft peach with vivid red
  "bg-[#e0f2fe] text-[#3b82f6] border-[2px] border-[#3b82f6]", // Light blue with bold blue
  "bg-[#f0abfc] text-[#a855f7] border-[2px] border-[#a855f7]", // Light pink with vibrant purple
  "bg-[#e4e7eb] text-[#10b981] border-[2px] border-[#10b981]", // Neutral gray with striking green
];
export const getColor = (index) => {
  if (index >= 0 && index < colors.length) {
    return colors[index];
  }
  return colors[0];
};

export const AnimationDefaultOption = {
  loop: true,
  autoplay: true,
  animationData,
};