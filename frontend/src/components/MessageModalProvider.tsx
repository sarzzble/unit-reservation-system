"use client";

import { useEffect, useState } from "react";
import { useMessages, UserMessage } from "@/components/context/MessagesContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/context/UserContext";

export default function MessageModalProvider() {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [unreadMessage, setUnreadMessage] = useState<UserMessage | null>(null);
  const { user } = useUser();
  const { inbox, markAsRead, refetchInbox } = useMessages();

  useEffect(() => {
    if (!user || user.is_staff) return;
    // UserMessage tabanlı yeni API'ye tam uyumlu kontrol
    // inbox'taki her mesajda sender, sender_name, recipient, recipient_name alanları olabilir
    // Öğrencinin kendi gönderdiği mesajlar modalda gösterilmesin
    const firstUnread = inbox.find(
      (msg) => msg.is_read === false && msg.sender !== user.id // kendi gönderdiği mesajı gösterme
    );
    if (firstUnread) {
      setUnreadMessage(firstUnread);
      setShowMessageModal(true);
    } else {
      setShowMessageModal(false);
      setUnreadMessage(null);
    }
  }, [user, inbox]);

  const handleCloseMessageModal = async () => {
    if (unreadMessage) {
      try {
        await markAsRead(unreadMessage.id);
        await refetchInbox();
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
