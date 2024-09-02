import React, { useState } from 'react';
import loginImage from '../../assets/login2.png';
import AuthForm from './AuthForm';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500">
      <div className="h-[85vh] w-[90vw] md:w-[70vw] lg:w-[80vw] xl:w-[70vw] bg-white shadow-2xl rounded-2xl grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        {/* Left side - Welcome message and Tabs */}
        <div className="flex flex-col gap-5 items-center justify-center p-8 md:p-10 bg-gradient-to-r from-white to-gray-100">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center flex items-center mb-5">
              <h1 className="text-black text-3xl font-bold md:text-4xl">Welcome</h1>
              <p className="text-3xl md:text-4xl font-bold">✌️</p>
            </div>
            <h2 className="text-gray-600 text-lg md:text-xl text-center font-medium mb-5">
              Fill in the details to get started with My Chat App
            </h2>
            <div className="w-full flex items-center justify-center mt-5">
              <AuthForm
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
              />
            </div>
          </div>
        </div>

        {/* Right side - Login Image */}
        <div className="hidden xl:flex items-center justify-center p-10 bg-gradient-to-l from-purple-100 to-white">
          <img src={loginImage} alt="Login Logo" className="w-2/3 h-auto object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
