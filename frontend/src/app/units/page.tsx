"use client";

import { useState } from "react";
import { getUnits, makeReservation } from "@/lib/api";
import { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { FaTooth } from "react-icons/fa";

interface Unit {
  id: number;
  number: string;
  reserved_time_slots: string[];
}

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const timeSlots = [
    "09:00-10:30",
    "10:30-12:00",
    "13:30-15:30",
    "15:30-17:00",
  ];

  const isTimeSlotPassed = (timeSlot: string) => {
    if (!date) return false;

    const today = new Date();
    const selectedDate = new Date(date);

    // If the selected date is not today, return false
    if (selectedDate.toDateString() !== today.toDateString()) {
      return false;
    }

    const [startTime] = timeSlot.split("-");
    const [hours, minutes] = startTime.split(":").map(Number);

    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return today > slotTime;
  };

  const fetchUnits = async () => {
    if (!date) return;

    setLoading(true);
    setIsSearching(true);
    setError("");

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const data = await getUnits(formattedDate);
      setUnits(data);
    } catch (err) {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUnits();
  };

  const handleTimeSlotClick = (unitId: number, timeSlot: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit || unit.reserved_time_slots.includes(timeSlot)) return;

    setSelectedUnit(unitId);
    setSelectedTimeSlot(timeSlot);
    setShowConfirmDialog(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedUnit || !date || !selectedTimeSlot) return;

    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      await makeReservation({
        unit: selectedUnit,
        date: formattedDate,
        time_slot: selectedTimeSlot,
      });
      setShowConfirmDialog(false);
      router.push("/my-reservations");
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
      <Navbar />
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white/95 backdrop-blur-sm shadow-xl border-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const isPast = date < today;
                      const isWeekend =
                        date.getDay() === 0 || date.getDay() === 6; // 0: Pazar, 6: Cumartesi

                      return isPast || isWeekend;
                    }}
                    locale={tr}
                    initialFocus
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="submit"
                disabled={isSearching || !date}
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm cursor-pointer"
              >
                {isSearching ? "Aranıyor..." : "Ara"}
              </Button>
            </form>

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
                        {timeSlots.map((timeSlot) => {
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
                                  : "bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md cursor-pointer"
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
                  date &&
                  selectedTimeSlot && (
                    <>
                      Ünit {units.find((u) => u.id === selectedUnit)?.number}{" "}
                      için {format(date, "PPP", { locale: tr })} tarihinde{" "}
                      {selectedTimeSlot} saatlerinde rezervasyon yapmak
                      istediğinizden emin misiniz?
                    </>
                  )
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              {error ? (
                <Button
                  onClick={handleCloseDialog}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  Tamam
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleConfirmReservation}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
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
