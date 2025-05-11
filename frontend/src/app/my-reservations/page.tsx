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

interface Reservation {
  id: number;
  unit: {
    number: string;
  };
  date: string;
  time_slot: string;
}

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
    const token = localStorage.getItem("access_token");
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Yükleniyor...</div>
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Rezervasyonlarım
            </h2>
            <p className="mt-3 text-xl text-gray-500">
              Tüm rezervasyonlarınızı buradan görüntüleyebilir ve
              yönetebilirsiniz
            </p>
          </div>

          <div className="mt-12">
            {reservations.length === 0 ? (
              <div className="text-center text-gray-500">
                Henüz rezervasyonunuz bulunmuyor.
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <li key={reservation.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                Ünite {reservation.unit.number}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(reservation.date).toLocaleDateString(
                                  "tr-TR"
                                )}{" "}
                                - {reservation.time_slot}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              onClick={() => handleCancel(reservation)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                            >
                              İptal Et
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Dialog open={showConfirmDialog} onOpenChange={handleCloseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {modalError ? "Hata" : "Rezervasyon İptali"}
                </DialogTitle>
                <DialogDescription>
                  {modalError ? (
                    <span className="text-red-600">{modalError}</span>
                  ) : (
                    selectedReservation && (
                      <>
                        Ünite {selectedReservation.unit.number} için{" "}
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
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    Tamam
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCloseDialog}
                      className="cursor-pointer"
                    >
                      Vazgeç
                    </Button>
                    <Button
                      onClick={handleConfirmCancel}
                      className="bg-red-600 hover:bg-red-700 cursor-pointer"
                    >
                      İptal Et
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
