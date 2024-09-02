import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@radix-ui/react-tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

const AuthForm = ({
  activeTab,
  setActiveTab,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();

  const validateLogin = () => {
    if (!email || !password) {
      toast.error('All fields are required');
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  // useEffect(() => {
    const handleLogin = async () => {
      try {
        const response = await apiClient.post(LOGIN_ROUTE, { email, password }, { withCredentials: true });
        if (response.data?.user?.id) {
          setUserInfo(response.data.user);
          navigate(response.data.user.defaultProfile === false ? '/profile' : '/chat');
        }
      } catch (error) {
        toast.error('Login failed');
      }
    };

    if (isLogin && validateLogin()) {
      handleLogin();
      setIsLogin(false); 
    }
  // }, [isLogin, email, password, navigate, setUserInfo]);

  // useEffect(() => {
    const handleSignup = async () => {
      try {
        const response = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate('/profile');
        }
      } catch (error) {
        toast.error('Signup failed');
      }
    };

    if (isSignup && validateSignup()) {
      handleSignup();
      setIsSignup(false); 
    }
  // }, [isSignup, email, password, confirmPassword, navigate, setUserInfo]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex justify-center bg-transparent rounded-none w-full mb-5">
        <TabsTrigger
          className="w-1/2 text-center data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-gray-600 p-3 md:p-4 font-semibold transition-all duration-300 cursor-pointer hover:text-purple-600"
          value="login"
        >
          Login
        </TabsTrigger>
        <TabsTrigger
          className="w-1/2 text-center data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 text-gray-600 p-3 md:p-4 font-semibold transition-all duration-300 cursor-pointer hover:text-purple-600"
          value="signup"
        >
          Signup
        </TabsTrigger>
      </TabsList>

      <TabsContent className="flex flex-col w-full gap-5" value="login">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-md focus:border-purple-500 focus:ring-2 focus:ring-purple-600"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-md focus:border-purple-500 focus:ring-2 focus:ring-purple-600"
        />
        <Button onClick={() => setIsLogin(true)} className="rounded-2xl cursor-pointer px-4 py-3">Login</Button>
      </TabsContent>

      <TabsContent className="flex flex-col w-full gap-5" value="signup">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-md focus:ring-2 focus:ring-purple-600 focus:border-purple-500"
        />
        <Button onClick={() => setIsSignup(true)} className="rounded-2xl cursor-pointer px-4 py-3">SignUp</Button>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
