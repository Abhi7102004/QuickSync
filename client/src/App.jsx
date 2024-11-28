import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/auth/Index";
import Profile from "./pages/profile/index";
import Chat from "./pages/chat/index";
import Error from "./pages/error/Error";
import { useAppStore } from "./store";
import { apiClient } from "./lib/api-client";
import { GET_USER_ROUTE } from "./utils/constants";

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const AppRouter = createBrowserRouter([
  {
    path: "/auth",
    element: (
      <AuthRoute>
        <Auth />
      </AuthRoute>
    ),
    errorElement: <Error />,
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
    errorElement: <Error />,
  },
  {
    path: "/chat",
    element: (
      <PrivateRoute>
        <Chat />
      </PrivateRoute>
    ),
    errorElement: <Error />,
  },
  {
    path: "*",
    element: <Navigate to="/auth" />,
  },
]);

const App = () => {
  const [loading, setLoading] = useState(true);
  const {setUserInfo } = useAppStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_ROUTE, {
          withCredentials: true,
        });
        if (response.data.success) {
          setUserInfo(response?.data?.user);
        } else {
          setUserInfo(undefined);
        }
      } catch (err) {
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUserInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
      <RouterProvider router={AppRouter} />
  );
};

export default App;
