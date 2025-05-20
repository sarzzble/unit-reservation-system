"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyReservations,
  cancelReservation,
  deletePastReservations,
  deleteSinglePastReservation,
} from "@/lib/api";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/auth";
import { FaTooth, FaTimes } from "react-icons/fa";
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
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteSingleLoading, setDeleteSingleLoading] = useState<number | null>(
    null
  );

  // Aktif ve geçmiş rezervasyonları ayır
  const activeReservations = reservations.filter(
    (reservation) => new Date(reservation.date) >= new Date()
  );
  const pastReservations = reservations.filter(
    (reservation) => new Date(reservation.date) < new Date()
  );

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

  const handleDeleteAllPast = async () => {
    setDeleteAllLoading(true);
    try {
      await deletePastReservations();
      fetchReservations();
    } catch (err) {
      if (err instanceof AxiosError) {
        setModalError(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Geçmiş rezervasyonlar silinirken bir hata oluştu"
        );
      } else {
        setModalError("Geçmiş rezervasyonlar silinirken bir hata oluştu");
      }
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const handleDeleteSinglePast = async (id: number) => {
    setDeleteSingleLoading(id);
    try {
      await deleteSinglePastReservation(id);
      fetchReservations();
    } catch (err) {
      if (err instanceof AxiosError) {
        setModalError(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Rezervasyon silinirken bir hata oluştu"
        );
      } else {
        setModalError("Rezervasyon silinirken bir hata oluştu");
      }
    } finally {
      setDeleteSingleLoading(null);
    }
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

          <Accordion
            type="multiple"
            className="w-full space-y-4"
            defaultValue={["active"]}
          >
            <AccordionItem value="active" className="px-4">
              <AccordionTrigger className="text-lg font-semibold text-green-700 hover:no-underline cursor-pointer">
                Rezervasyonlarım
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4 py-4">
                  {activeReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-white rounded-md shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <FaTooth className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm sm:text-lg font-semibold text-gray-900">
                            Ünit {reservation.unit.number}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(reservation.date).toLocaleDateString(
                              "tr-TR"
                            )}{" "}
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
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="open" className="px-4">
              <AccordionTrigger className="text-lg font-semibold text-gray-600 hover:no-underline cursor-pointer">
                Geçmiş Rezervasyonlarım
              </AccordionTrigger>
              <AccordionContent>
                {pastReservations.length > 0 && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handleDeleteAllPast}
                      disabled={deleteAllLoading}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      {deleteAllLoading ? "Siliniyor..." : "Tümünü Temizle"}
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-4 py-4">
                  {pastReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-gray-50 rounded-md shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <FaTooth className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm sm:text-lg font-semibold text-gray-500">
                            Ünit {reservation.unit.number}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {new Date(reservation.date).toLocaleDateString(
                              "tr-TR"
                            )}{" "}
                            - {reservation.time_slot}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSinglePast(reservation.id)}
                        disabled={deleteSingleLoading === reservation.id}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
