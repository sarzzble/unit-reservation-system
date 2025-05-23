"use client";

import { useEffect, useState } from "react";
import { useMessages } from "@/components/context/MessagesContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useUser } from "@/components/context/UserContext";

interface Message {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessageModalProvider() {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [unreadMessage, setUnreadMessage] = useState<Message | null>(null);
  const pathname = usePathname();
  const { user } = useUser();
  const { messages, markAsRead, refetch } = useMessages();

  useEffect(() => {
    if (!user || user.is_staff) return;
    const firstUnread = messages.find((msg) => msg.is_read === false);
    if (firstUnread) {
      setUnreadMessage(firstUnread);
      setShowMessageModal(true);
    } else {
      setShowMessageModal(false);
      setUnreadMessage(null);
    }
  }, [pathname, user, messages]);

  const handleCloseMessageModal = async () => {
    if (unreadMessage) {
      try {
        await markAsRead(unreadMessage.id);
        await refetch();
      } catch {}
    }
    setShowMessageModal(false);
  };

  return (
    <Dialog open={showMessageModal} onOpenChange={handleCloseMessageModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Mesaj</DialogTitle>
          <DialogDescription>
            {unreadMessage && (
              <>
                <span className="font-semibold text-green-700 mb-2 block">
                  {unreadMessage.title}
                </span>
                <br />
                <span className="text-gray-700 mb-2 block">
                  {unreadMessage.content}
                </span>
                <br />
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(unreadMessage.created_at).toLocaleString("tr-TR")}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleCloseMessageModal}
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            Tamam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
