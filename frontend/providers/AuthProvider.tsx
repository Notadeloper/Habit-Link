import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { api } from "@/lib/api";
import { AppUser } from "@/types/app";

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (usernameOrEmail: string, password: string) => Promise<AppUser>;
  signUp: (payload: {
    username: string;
    email: string;
    fullName: string;
    password: string;
  }) => Promise<AppUser>;
  updateProfile: (payload: {
    username?: string;
    email?: string;
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
    dayStart?: string;
  }) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get<{ user: AppUser }>("/auth/getme");
      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
        return;
      }
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const signIn = async (usernameOrEmail: string, password: string) => {
    const response = await api.post<{ user: AppUser }>("/auth/login", {
      usernameOrEmail,
      password,
    });

    setUser(response.data.user);
    return response.data.user;
  };

  const signUp = async (payload: {
    username: string;
    email: string;
    fullName: string;
    password: string;
  }) => {
    const response = await api.post<{ user: AppUser }>("/auth/signup", payload);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (payload: {
    username?: string;
    email?: string;
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
    dayStart?: string;
  }) => {
    try {
      await api.put("/user/profile", payload);
      await refreshUser();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error ?? error.message);
      }

      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      updateProfile,
      refreshUser,
      logout,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
