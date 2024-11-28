import React, { useState } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

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
  const navigate = useNavigate();
  const { setUserInfo,userInfo } = useAppStore();

  const handleLogin = async () => {
    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        console.log(response.data.user)
        setUserInfo(response?.data?.user);
        console.log(userInfo)
        navigate(
          response.data.user.defaultProfile === false ? "/profile" : "/chat"
        );
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const handleSignup = async () => {
    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { email, password },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        setUserInfo(response?.data?.user);
        navigate("/profile");
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

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
        <Button
          onClick={handleLogin}
          className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white cursor-pointer px-4 py-3 hover:from-purple-600 hover:to-indigo-600 transition-colors duration-300"
        >
          Login
        </Button>
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
        <Button
          onClick={handleSignup}
          className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white cursor-pointer px-4 py-3 hover:from-purple-600 hover:to-indigo-600 transition-colors duration-300"
        >
          SignUp
        </Button>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
