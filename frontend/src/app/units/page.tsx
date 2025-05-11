"use client";

import { useState, useEffect } from "react";
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

interface Unit {
  id: number;
  number: string;
  is_reserved: boolean;
}

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [isTimeSlotsOpen, setIsTimeSlotsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const timeSlots = [
    "09:00-10:30",
    "10:30-12:00",
    "13:30-15:30",
    "15:30-17:00",
  ];

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
          err.response?.data?.error || "Üniteler yüklenirken bir hata oluştu"
        );
      } else {
        setError("Üniteler yüklenirken bir hata oluştu");
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

  const handleUnitClick = (unitId: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
    setSelectedUnit(unitId);
    setIsTimeSlotsOpen(true);
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setIsTimeSlotsOpen(false);
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

  // Popover dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popover = document.getElementById("time-slots-popover");
      if (popover && !popover.contains(event.target as Node)) {
        setIsTimeSlotsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTimeSlotsOpen]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Diş Üniteleri
            </h2>
            <p className="mt-3 text-xl text-gray-500">
              Rezervasyon yapmak istediğiniz üniteyi seçin
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
                      "w-[240px] justify-start text-left font-normal cursor-pointer",
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="submit"
                disabled={isSearching || !date}
                className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
              >
                {isSearching ? "Aranıyor..." : "Ara"}
              </Button>
            </form>

            {loading ? (
              <div className="flex justify-center">
                <div className="text-xl">Yükleniyor...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className={`relative bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 ${
                      unit.is_reserved ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) =>
                      !unit.is_reserved && handleUnitClick(unit.id, e)
                    }
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Ünite {unit.number}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {unit.is_reserved ? "Dolu" : "Müsait"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isTimeSlotsOpen && selectedUnit && (
            <div
              id="time-slots-popover"
              className="fixed z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              style={{
                left: `${popoverPosition.x}px`,
                top: `${popoverPosition.y}px`,
              }}
            >
              <div className="py-1">
                {timeSlots.map((timeSlot) => (
                  <button
                    key={timeSlot}
                    onClick={() => handleTimeSlotClick(timeSlot)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{error ? "Hata" : "Rezervasyon Onayı"}</DialogTitle>
              <DialogDescription>
                {error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  selectedUnit &&
                  date &&
                  selectedTimeSlot && (
                    <>
                      Ünite {units.find((u) => u.id === selectedUnit)?.number}{" "}
                      için {format(date, "PPP", { locale: tr })} tarihinde{" "}
                      {selectedTimeSlot} saatlerinde rezervasyon yapmak
                      istediğinizden emin misiniz?
                    </>
                  )
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              {error ? (
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
                    İptal
                  </Button>
                  <Button
                    onClick={handleConfirmReservation}
                    className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
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
