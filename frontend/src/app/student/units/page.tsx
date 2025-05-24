"use client";

import { useState, useEffect } from "react";
import { getUnits, makeReservation, getDutyTeacherByDate } from "@/lib/api";
import { AxiosError } from "axios";
import { StudentNavbar } from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { FaTooth } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { Unit, DutyTeacher } from "@/interfaces";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateOptions, setDateOptions] = useState<
    {
      label: string;
      value: Date;
    }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [dutyTeacher, setDutyTeacher] = useState<DutyTeacher | null>(null);
  const [dutyTeacherError, setDutyTeacherError] = useState("");

  // Dropdown için önümüzdeki haftanın pazartesi-cuma günlerini hesapla
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start: Date;
    if (today.getDay() === 0) {
      start = addDays(today, 1);
    } else {
      const daysUntilNextMonday = 8 - today.getDay();
      start = addDays(today, daysUntilNextMonday);
    }
    const options = Array.from({ length: 5 }, (_, i) => {
      const d = addDays(start, i);
      // Gün adı ekle
      const dayName = format(d, "EEEE", { locale: tr });
      return {
        label: `${format(d, "PPP", { locale: tr })} (${dayName})`,
        value: d,
      };
    });
    setDateOptions(options);
  }, []);

  const isTimeSlotPassed = (timeSlot: string) => {
    if (!selectedDate) return false;

    const today = new Date();
    const selectedDateObj = new Date(selectedDate);

    // If the selected date is not today, return false
    if (selectedDateObj.toDateString() !== today.toDateString()) {
      return false;
    }

    const [startTime] = timeSlot.split("-");
    const [hours, minutes] = startTime.split(":").map(Number);

    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return today > slotTime;
  };

  // Takvimde tarih seçildiğinde sadece selectedDate güncellenir
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIsSearching(true);
    try {
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const data = await getUnits(formattedDate);
        setUnits(data);
        const duty = await getDutyTeacherByDate(formattedDate);
        setDutyTeacher(duty);
        setDutyTeacherError("");
      } else {
        setUnits([]);
        setDutyTeacher(null);
        setDutyTeacherError("");
      }
    } catch (err) {
      setUnits([]);
      setDutyTeacher(null);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error || "Ünitler yüklenirken bir hata oluştu"
        );
      } else {
        setError("Ünitler yüklenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleTimeSlotClick = (unitId: number, timeSlot: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit || unit.reserved_time_slots.includes(timeSlot)) return;

    setSelectedUnit(unitId);
    setSelectedTimeSlot(timeSlot);
    setShowConfirmDialog(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedUnit || !selectedDate || !selectedTimeSlot) return;

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      await makeReservation({
        unit: selectedUnit,
        date: formattedDate,
        time_slot: selectedTimeSlot,
      });
      setShowConfirmDialog(false);
      router.push("/student/my-reservations");
    } catch (err) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Rezervasyon yapılırken bir hata oluştu";
        setError(errorMessage);
      } else {
        setError("Rezervasyon yapılırken bir hata oluştu");
      }
    }
  };

  const handleCloseDialog = () => {
    setError("");
    setSelectedTimeSlot(null);
    setSelectedUnit(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <StudentNavbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold sm:text-5xl text-green-700">
              Diş Ünitleri
            </h2>
            <p className="mt-3 text-xl max-md:text-sm text-gray-600">
              Rezervasyon yapmak istediğiniz üniti seçin
            </p>
          </div>

          <div className="mt-8">
            <form
              onSubmit={handleSearch}
              className="flex justify-center gap-4 mb-8"
            >
              <Select
                value={selectedDate ? selectedDate.getTime().toString() : ""}
                onValueChange={(val) => {
                  const found = dateOptions.find(
                    (opt) => opt.value.getTime().toString() === val
                  );
                  setSelectedDate(found ? found.value : undefined);
                }}
              >
                <SelectTrigger className="w-[260px] bg-white/90 shadow-sm flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2">
                    <CiCalendar className="w-5 h-5" />
                    <SelectValue placeholder="Tarih seçin" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((opt) => (
                    <SelectItem
                      key={opt.value.getTime()}
                      value={opt.value.getTime().toString()}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                disabled={isSearching || !selectedDate}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer"
              >
                {isSearching ? "Aranıyor..." : "Ara"}
              </Button>
            </form>
            {/* Nöbetçi öğretmen bilgisi */}
            {selectedDate && (
              <div className="flex justify-center mb-4">
                {dutyTeacherError ? (
                  <span className="text-red-600 text-sm font-medium">
                    {dutyTeacherError}
                  </span>
                ) : dutyTeacher ? (
                  <span className="text-green-700 text-sm font-medium">
                    {format(selectedDate, "PPP", { locale: tr })} günü nöbetçi
                    öğretmen:{" "}
                    <b>
                      {dutyTeacher.first_name} {dutyTeacher.last_name}
                    </b>
                  </span>
                ) : null}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center">
                <div className="text-xl text-gray-600">Yükleniyor...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="relative bg-white/90 rounded-xl shadow-sm"
                  >
                    <div className="px-6 py-6">
                      <div className="flex items-center gap-3 mb-4">
                        <FaTooth className="w-6 h-6 text-green-600" />
                        <h3 className="text-2xl max-md:text-lg font-bold text-gray-800">
                          Ünit {unit.number}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {unit.available_time_slots.map((timeSlot) => {
                          const isReserved =
                            unit.reserved_time_slots.includes(timeSlot);
                          const isPassed = isTimeSlotPassed(timeSlot);
                          return (
                            <button
                              key={timeSlot}
                              onClick={() =>
                                handleTimeSlotClick(unit.id, timeSlot)
                              }
                              disabled={isReserved || isPassed}
                              className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isReserved || isPassed
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer"
                              }`}
                            >
                              {timeSlot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog
          open={showConfirmDialog || !!error}
          onOpenChange={handleCloseDialog}
        >
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {error ? "Hata" : "Rezervasyon Onayı"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  selectedUnit &&
                  selectedDate &&
                  selectedTimeSlot && (
                    <>
                      Ünit {units.find((u) => u.id === selectedUnit)?.number}{" "}
                      için {format(selectedDate, "PPP", { locale: tr })}{" "}
                      tarihinde {selectedTimeSlot} saatlerinde rezervasyon
                      yapmak istediğinizden emin misiniz?
                    </>
                  )
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              {error ? (
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
                    className="cursor-pointer"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleConfirmReservation}
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    Onayla
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
