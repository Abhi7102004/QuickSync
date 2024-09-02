import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useEffect } from 'react';
import ContactContainer from './ContactContainer';
import ChatContainer from './ChatContainer';
import EmptyContainer from './EmptyContainer';
import { useProfileImage } from "@/utils/custom-hooks/useProfileImage";
const Chat = () => {
  useProfileImage();
  const { userInfo, setUserInfo,selectedChatType,selectedChatData } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    const ProfileUpdate = userInfo.defaultProfile;
    const checkProfile = !!ProfileUpdate;
    if (!checkProfile) {
      navigate('/profile');
    }
  }, [userInfo, navigate]);

  return (
    <div className='flex h-[100vh] text-white overflow-hidden'>
      <ContactContainer/>
      {
        selectedChatType===undefined ? <EmptyContainer/> : <ChatContainer/>
      }
    </div>
  );
};

export default Chat;
