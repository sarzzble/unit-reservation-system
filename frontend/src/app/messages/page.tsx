"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/Navbar";
import {
  getMessages,
  getUserInfo,
  deleteMessage,
  deleteAllMessages,
} from "@/lib/api";
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

interface Message {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = await getUserInfo();
        setIsTeacher(user.is_staff);
        const data = await getMessages();
        setMessages(data);
      } catch {
        setError("Mesajlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = async (id: number) => {
    setSelectedMessageId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedMessageId !== null) {
      try {
        await deleteMessage(selectedMessageId);
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== selectedMessageId)
        );
      } catch {
        setError("Mesaj silinirken bir hata oluştu.");
      } finally {
        setShowConfirmDialog(false);
        setSelectedMessageId(null);
      }
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMessages();
      setMessages([]);
    } catch {
      setError("Tüm mesajlar silinirken bir hata oluştu.");
    }
  };

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
          isTeacher
            ? "bg-gradient-to-br from-blue-50 to-blue-100"
            : "bg-gradient-to-br from-green-50 to-green-100"
        }`}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2
              className={`text-2xl font-bold ${
                isTeacher ? "text-blue-700" : "text-green-700"
              }`}
            >
              Gelen Mesajlar
            </h2>
            {messages.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ml-2 cursor-pointer"
              >
                Tümünü Sil
              </Button>
            )}
          </div>
          {loading && <div>Yükleniyor...</div>}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {messages.length === 0 && !loading && (
            <div className="text-gray-500">Hiç mesajınız yok.</div>
          )}
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-lg shadow p-4 border flex justify-between items-center ${
                  isTeacher ? "border-blue-100" : "border-green-100"
                }`}
              >
                <div>
                  <div
                    className={`font-semibold ${
                      isTeacher ? "text-blue-700" : "text-green-700"
                    }`}
                  >
                    {msg.title}
                  </div>
                  <div className="text-gray-700 mt-1">{msg.content}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(msg.created_at).toLocaleString("tr-TR")}
                  </div>
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
