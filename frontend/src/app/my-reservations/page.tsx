"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyReservations, cancelReservation } from "@/lib/api";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/auth";
import { FaTooth } from "react-icons/fa";
import { Reservation } from "@/interfaces";

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalError, setModalError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      const data = await getMyReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err instanceof AxiosError) {
        setFetchError(
          err.response?.data?.error ||
            "Rezervasyonlar yüklenirken bir hata oluştu"
        );
      } else {
        setFetchError("Rezervasyonlar yüklenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchReservations();
  }, [router]);

  const handleCancel = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalError("");
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    try {
      await cancelReservation(selectedReservation.id);
      setShowConfirmDialog(false);
      fetchReservations();
    } catch (err) {
      if (err instanceof AxiosError) {
        setModalError(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Rezervasyon iptal edilirken bir hata oluştu"
        );
      } else {
        setModalError("Rezervasyon iptal edilirken bir hata oluştu");
      }
    }
  };

  const handleCloseDialog = () => {
    setModalError("");
    setSelectedReservation(null);
    setShowConfirmDialog(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center text-gray-600">Yükleniyor...</div>
          </div>
        </div>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">{fetchError}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold sm:text-5xl text-green-700">
              Rezervasyonlarım
            </h2>
            <p className="mt-3 text-lg max-md:text-sm text-gray-600">
              Tüm rezervasyonlarınızı buradan görüntüleyebilir ve
              yönetebilirsiniz
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center text-gray-600 max-md:text-sm">
              Henüz rezervasyonunuz bulunmuyor.
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-md shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <FaTooth className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-lg font-semibold text-gray-900">
                        Ünit {reservation.unit.number}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {new Date(reservation.date).toLocaleDateString("tr-TR")}{" "}
                        - {reservation.time_slot}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(reservation)}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                  >
                    İptal Et
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {modalError ? "Hata" : "Rezervasyon İptali"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {modalError ? (
                  <span className="text-red-600">{modalError}</span>
                ) : (
                  selectedReservation && (
                    <>
                      Ünit {selectedReservation.unit.number} için{" "}
                      {new Date(selectedReservation.date).toLocaleDateString(
                        "tr-TR"
                      )}{" "}
                      tarihinde {selectedReservation.time_slot} saatlerindeki
                      rezervasyonu iptal etmek istediğinizden emin misiniz?
                    </>
                  )
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {modalError ? (
                <Button
                  onClick={handleCloseDialog}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  Tamam
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    Vazgeç
                  </Button>
                  <Button
                    onClick={handleConfirmCancel}
                    className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  >
                    İptal Et
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
