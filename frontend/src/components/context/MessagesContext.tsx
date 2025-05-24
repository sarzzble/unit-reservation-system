"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getInboxMessages,
  getSentMessages,
  patchUserMessageRead,
  deleteUserMessage,
} from "@/lib/api";
import { getCookie } from "@/lib/auth";

export interface UserMessage {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: number;
  sender_name: string;
  sender_number: string;
  recipient: number;
  recipient_name: string;
  box_type: "inbox" | "sent";
}

interface MessagesContextType {
  inbox: UserMessage[];
  sentbox: UserMessage[];
  loading: boolean;
  error: string;
  refetchInbox: () => Promise<void>;
  refetchSentbox: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  removeMessage: (id: number, box: "inbox" | "sent") => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined
);

export const MessagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [inbox, setInbox] = useState<UserMessage[]>([]);
  const [sentbox, setSentbox] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kullanıcı veya token değiştiğinde kutuları güncelle
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR koruması
    const accessToken = getCookie("access_token");
    if (!accessToken) return;
    fetchInbox();
    fetchSentbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInboxMessages();
      setInbox(data);
    } catch {
      setError("Gelen kutusu yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentbox = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSentMessages();
      setSentbox(data);
    } catch {
      setError("Gönderilen kutusu yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    await patchUserMessageRead(id);
    setInbox((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
    );
    setSentbox((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, is_read: true } : msg))
    );
  };

  const removeMessage = async (id: number, box: "inbox" | "sent") => {
    await deleteUserMessage(id);
    if (box === "inbox") {
      setInbox((prev) => prev.filter((msg) => msg.id !== id));
    } else {
      setSentbox((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  return (
    <MessagesContext.Provider
      value={{
        inbox,
        sentbox,
        loading,
        error,
        refetchInbox: fetchInbox,
        refetchSentbox: fetchSentbox,
        markAsRead,
        removeMessage,
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
