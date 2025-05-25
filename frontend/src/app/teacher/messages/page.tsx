"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TeacherNavbar } from "@/components/Navbar";
import { FaTrash } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/components/context/MessagesContext";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/context/UserContext";

type UserMessage = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  sender?: number;
  sender_name?: string;
  sender_number?: string;
  recipient?: number;
  recipient_name?: string;
  box_type?: "inbox" | "sent";
};

export default function TeacherMessagesPage() {
  const { inbox, loading, error, refetchInbox, removeMessage } = useMessages();
  const { loading: userLoading, refetch: refetchUser } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    refetchUser();
    refetchInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gelen kutusu doğrudan context'ten alınır
  const incomingMessages = inbox;

  const handleDelete = async (id: number) => {
    setSelectedMessageId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedMessageId !== null) {
      try {
        await removeMessage(selectedMessageId, "inbox");
      } catch {}
      setShowConfirmDialog(false);
      setSelectedMessageId(null);
    }
  };

  return (
    <>
      <TeacherNavbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            Gelen Mesajlar
          </h2>
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => router.push("/teacher/send-message")}
              variant="default"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              Mesaj Gönder
            </Button>
            <Button
              onClick={() => router.push("/teacher/sent-messages")}
              variant="outline"
              size="sm"
              className="text-blue-700 border-blue-200 hover:bg-blue-50 ml-2 cursor-pointer"
            >
              Gönderilen Mesajlar
            </Button>
          </div>
          {(loading || userLoading) && <div>Yükleniyor...</div>}
          {!loading && !userLoading && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading &&
            !userLoading &&
            incomingMessages.length === 0 &&
            !error && <div className="text-gray-500">Hiç mesajınız yok.</div>}
          <div className="space-y-4">
            <div className="overflow-x-visible">
              <div className="min-w-[250px] w-full sm:w-auto sm:min-w-[350px] sm:max-w-none mx-auto">
                {incomingMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white rounded-lg shadow p-4 border flex flex-col sm:flex-row justify-between items-start sm:items-center border-blue-100 mb-2 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => {
                      setSelectedMessage(msg);
                      setShowMessageModal(true);
                    }}
                  >
                    <div className="w-full flex flex-col">
                      <span className="font-semibold text-blue-700 mb-2 block break-words">
                        {msg.title}
                      </span>
                      <span
                        className="text-gray-700 mb-2 block break-words overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          whiteSpace: "normal",
                          maxHeight: "4.5em",
                        }}
                        title={
                          msg.content.length > 200 ? msg.content : undefined
                        }
                      >
                        {msg.content.length > 200
                          ? msg.content.slice(0, 200) + "..."
                          : msg.content}
                      </span>
                      <span className="text-xs text-gray-400 mt-2 block">
                        {new Date(msg.created_at).toLocaleString("tr-TR")}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Gönderen: {msg.sender_name}{" "}
                        {msg.sender_number ? `(${msg.sender_number})` : ""}
                      </span>
                    </div>
                    <div
                      className="flex-shrink-0 mt-2 sm:mt-0 sm:ml-4 self-end sm:self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        onClick={() => handleDelete(msg.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        title="Mesajı Sil"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesajı Sil</DialogTitle>
            <DialogDescription>
              Silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setShowConfirmDialog(false)}
            >
              Vazgeç
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader className="max-md:text-left">
            <DialogTitle className="text-blue-700">
              {selectedMessage?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="mt-2">
              <div className="text-gray-700 whitespace-pre-line break-words mb-2">
                {selectedMessage.content}
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {new Date(selectedMessage.created_at).toLocaleString("tr-TR")}
              </div>
              <div className="text-xs text-gray-500">
                Gönderen: {selectedMessage.sender_name}{" "}
                {selectedMessage.sender_number
                  ? `(${selectedMessage.sender_number})`
                  : ""}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
