"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FaUserGraduate, FaTrash, FaSearch } from "react-icons/fa";
import { AxiosError } from "axios";
import Link from "next/link";

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
import {
  getReservations,
  cancelReservation,
  getDutyTeacherByDate,
} from "@/lib/api";
import { TeacherReservation } from "@/interfaces";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/UserContext";

export default function TeacherUnitsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [reservations, setReservations] = useState<TeacherReservation[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<
    number | null
  >(null);
  const [searchStudentNumber, setSearchStudentNumber] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedStudentName, setSearchedStudentName] = useState<string>("");
  const [isDutyToday, setIsDutyToday] = useState(false);
  const [dutyTeacherName, setDutyTeacherName] = useState<string>("");

  useEffect(() => {
    if (userLoading) {
      return; // Wait until user loading is complete
    }

    if (!user) {
      setLoading(false);
      router.push("/"); // Redirect if no user is logged in
      return;
    }

    if (!user.is_staff) {
      setLoading(false);
      router.push("/"); // Redirect if the user is not a teacher
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoading(true); // Start loading
        const reservationsData = await getReservations();
        setReservations(reservationsData);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            setLoading(false);
            router.push("/");
            return;
          }
          setError(error.response?.data?.error || "Bir hata oluştu");
        } else {
          setError("Beklenmeyen bir hata oluştu");
        }
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchReservations();
  }, [userLoading, user, router]);

  useEffect(() => {
    if (!user || !user.is_staff) return;
    const checkDuty = async () => {
      const today = new Date();
      const formatted = format(today, "yyyy-MM-dd");
      try {
        const duty = await getDutyTeacherByDate(formatted);
        if (duty.email === user.email) {
          setIsDutyToday(true);
          setDutyTeacherName(`${duty.first_name} ${duty.last_name}`);
        } else {
          setIsDutyToday(false);
          setDutyTeacherName("");
        }
      } catch {
        setIsDutyToday(false);
        setDutyTeacherName("");
      }
    };
    checkDuty();
  }, [user]);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSearchLoading(true);
    try {
      // Eğer arama kutusu boşsa, tüm rezervasyonları getir
      if (!searchStudentNumber) {
        const data = await getReservations();
        setReservations(data);
        setSearchedStudentName("");
      } else {
        const data = await getReservations(searchStudentNumber);
        setReservations(data);
        if (data.length > 0) {
          setSearchedStudentName(
            data[0].user.first_name + " " + data[0].user.last_name
          );
        } else {
          setSearchedStudentName("");
        }
      }
    } catch (error) {
      setReservations([]);
      setSearchedStudentName("");
      if (error instanceof AxiosError) {
        setError(error.response?.data?.error || "Bir hata oluştu");
      } else {
        setError("Beklenmeyen bir hata oluştu");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Nöbetçi öğretmen uyarısı: başlık ve filtrelerin hemen altında, sayfanın üst-orta kısmında */}
            {isDutyToday && dutyTeacherName && (
              <div className="flex justify-center mb-4">
                <span className="animate-pulse bg-yellow-200 text-yellow-900 px-4 py-1 rounded font-semibold text-xs shadow border border-yellow-400">
                  BUGÜN NÖBETÇİSİNİZ
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Ünit Rezervasyonları
                </h1>
                <p className="text-gray-600 mt-1">
                  {searchedStudentName
                    ? `"${searchedStudentName}" isimli öğrenciye ait rezervasyonlar`
                    : "Tüm öğrenci rezervasyonları"}
                </p>
              </div>
              <Link
                href="/teacher/students"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded shadow text-sm transition-colors duration-200"
              >
                Öğrenci Listesine Git
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 mb-6"
            >
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  placeholder="Öğrenci Numarası"
                  value={searchStudentNumber}
                  onChange={(e) => {
                    // Sadece rakam girilmesine izin ver
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setSearchStudentNumber(val);
                  }}
                  className="w-48 bg-white pr-10"
                />
                <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <Button
                type="submit"
                disabled={searchLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                {searchLoading ? "Aranıyor..." : "Ara"}
              </Button>
            </form>

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
                        {reservation.user.first_name}{" "}
                        {reservation.user.last_name}
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
      </div>
    </div>
  );
}
