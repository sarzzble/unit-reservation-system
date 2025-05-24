"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserInfo } from "@/lib/api";
import { User } from "@/interfaces";
import { getCookie } from "@/lib/auth";

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    // Eğer access_token yoksa loading'i false yap!
    if (!getCookie("access_token")) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const userData = await getUserInfo();
      setUser(userData);
    } catch {
      setUser(null);
      setError("Kullanıcı bilgisi alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, error, refetch: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
