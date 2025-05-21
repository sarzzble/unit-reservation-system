"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FaUserGraduate, FaTrash } from "react-icons/fa";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getReservations, cancelReservation, getUserInfo } from "@/lib/api";
import { TeacherReservation } from "@/interfaces";
import Navbar from "@/components/Navbar";

export default function TeacherUnitsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<TeacherReservation[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchUserAndReservations = async () => {
      try {
        // Kullanıcı bilgilerini al
        const userData = await getUserInfo();

        // Eğer öğretmen değilse ana sayfaya yönlendir
        if (!userData.is_staff) {
          router.push("/");
          return;
        }

        // Rezervasyonları getir
        const reservationsData = await getReservations();
        setReservations(reservationsData);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            router.push("/");
            return;
          }
          setError(error.response?.data?.error || "Bir hata oluştu");
        } else {
          setError("Beklenmeyen bir hata oluştu");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndReservations();
  }, [router]);

  const handleDeleteReservation = async (id: number) => {
    try {
      await cancelReservation(id);
      // Rezervasyonları yeniden yükle
      const data = await getReservations();
      setReservations(data);
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.error ||
            "Rezervasyon silinirken bir hata oluştu"
        );
      } else {
        setError("Rezervasyon silinirken bir hata oluştu");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Ünit Rezervasyonları
              </h1>
              <p className="text-gray-600 mt-1">Tüm öğrenci rezervasyonları</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ünit No</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Öğrenci</TableHead>
                  <TableHead>Sınıf</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.unit.number}</TableCell>
                    <TableCell>
                      {format(new Date(reservation.date), "d MMMM yyyy", {
                        locale: tr,
                      })}
                    </TableCell>
                    <TableCell>{reservation.time_slot}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FaUserGraduate className="text-gray-500" />
                      {reservation.user.first_name} {reservation.user.last_name}
                      <span className="text-gray-500">
                        ({reservation.user.student_number})
                      </span>
                    </TableCell>
                    <TableCell>
                      {reservation.user.student_class}. Sınıf
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedReservationId(reservation.id);
                            setShowConfirmDialog(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-500">
                        Henüz rezervasyon yapılmamış
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rezervasyon Sil</DialogTitle>
            <DialogDescription>
              Silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="cursor-pointer"
            >
              Vazgeç
            </Button>
            <Button
              onClick={async () => {
                if (selectedReservationId) {
                  await handleDeleteReservation(selectedReservationId);
                  setShowConfirmDialog(false);
                  setSelectedReservationId(null);
                }
              }}
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
