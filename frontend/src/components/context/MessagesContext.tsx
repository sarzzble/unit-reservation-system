"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getMessages,
  patchMessageRead,
  deleteMessage,
  deleteAllMessages,
} from "@/lib/api";
import { getCookie } from "@/lib/auth";

export interface Message {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  recipient: number;
  recipient_name: string;
  sender: number;
  sender_name: string;
}

interface MessagesContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  removeMessage: (id: number) => Promise<void>;
  removeAll: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export const MessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMessages();
      setMessages(data);
    } catch {
      setError("Mesajlar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Eğer access_token yoksa fetch başlatma
    if (!getCookie("access_token")) return;
    fetchMessages();
  }, []);

  const markAsRead = async (id: number) => {
    await patchMessageRead(id);
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
    );
  };

  const removeMessage = async (id: number) => {
    await deleteMessage(id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const removeAll = async () => {
    await deleteAllMessages();
    setMessages([]);
  };

  return (
    <MessagesContext.Provider
      value={{
        messages,
        setMessages,
        loading,
        error,
        refetch: fetchMessages,
        markAsRead,
        removeMessage,
        removeAll,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context)
    throw new Error("useMessages must be used within a MessagesProvider");
  return context;
};
