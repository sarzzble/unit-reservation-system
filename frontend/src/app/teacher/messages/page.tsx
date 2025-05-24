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

export default function TeacherMessagesPage() {
  const { inbox, loading, error, refetchInbox, removeMessage } = useMessages();
  const { loading: userLoading, refetch: refetchUser } = useUser();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    refetchUser();
    refetchInbox();
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Gelen Mesajlar</h2>
            <div className="flex gap-2">
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
            {incomingMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg shadow p-4 border flex justify-between items-center border-blue-100"
              >
                <div>
                  <span className="font-semibold text-blue-700 mb-2 block">
                    {msg.title}
                  </span>
                  <span className="text-gray-700 mb-2 block">
                    {msg.content}
                  </span>
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(msg.created_at).toLocaleString("tr-TR")}
                  </span>
                </div>
                <Button
                  onClick={() => handleDelete(msg.id)}
                  variant="ghost"
                  size="sm"
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  title="Mesajı Sil"
                >
                  <FaTrash className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
    </>
  );
}
