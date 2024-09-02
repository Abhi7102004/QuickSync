import { useEffect, useState } from "react";
import { useAppStore } from "@/store";

export const useProfileImage = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [image, setImage] = useState("");

  useEffect(() => {
    if (userInfo?.image) {
      if (typeof userInfo.image === "string" && userInfo.image.startsWith("data:")) {
        setImage(userInfo.image);
      } else {
        const { type, data } = userInfo.image;
        if (data && Array.isArray(data)) {
          const base64String = btoa(
            new Uint8Array(data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          const base64Image = `data:${type};base64,${base64String}`;
          setImage(base64Image);
          setUserInfo({ ...userInfo, image: base64Image });
        } else {
          console.error("Invalid image data format");
        }
      }
    }
  }, [userInfo, setUserInfo]);

  return {
    image,
    setImage,
  };
};
