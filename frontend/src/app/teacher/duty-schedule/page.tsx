"use client";

import React, { useEffect, useState } from "react";
import { getDutyScheduleList } from "@/lib/api";
import { TeacherNavbar } from "@/components/Navbar";
import {
  format,
  parseISO,
  addDays,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { tr } from "date-fns/locale";

interface DutySchedule {
  id: number;
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    student_number?: string;
    email?: string;
  };
  date?: string;
  created_at?: string;
}

const DutySchedulePage = () => {
  const [dutyList, setDutyList] = useState<DutySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDutyScheduleList()
      .then((data) => {
        setDutyList(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Nöbetçi öğretmen listesi alınamadı.");
        setLoading(false);
      });
  }, []);

  // Haftanın başlangıcı (bugün dahil, pazartesi)
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Sonraki hafta için kalan öğretmenleri bul ve sırala
  const nextWeekStart = addDays(weekEnd, 1);
  const nextWeekEnd = addDays(nextWeekStart, 4); // Pazartesi-Cuma
  const nextWeekDuties = dutyList
    .filter((duty) => {
      if (!duty.date) return false;
      const dutyDate = parseISO(duty.date);
      return (
        isAfter(dutyDate, addDays(nextWeekStart, -1)) &&
        isBefore(dutyDate, addDays(nextWeekEnd, 1)) &&
        dutyDate.getDay() >= 1 &&
        dutyDate.getDay() <= 5
      );
    })
    .sort((a, b) =>
      a.date && b.date
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : 0
    );

  // Eğer sonraki haftada eksik gün varsa, kalan öğretmenleri sırayla ata
  const filledNextWeek = [...nextWeekDuties];
  if (nextWeekDuties.length < 5) {
    const usedTeacherIds = new Set(nextWeekDuties.map((d) => d.teacher.id));
    const unusedTeachers = dutyList
      .filter(
        (d) =>
          d.date &&
          parseISO(d.date) >= nextWeekStart &&
          !usedTeacherIds.has(d.teacher.id)
      )
      .map((d) => d.teacher);
    for (let i = nextWeekDuties.length; i < 5; i++) {
      if (unusedTeachers[i - nextWeekDuties.length]) {
        filledNextWeek.push({
          id: 10000 + i, // string yerine number id
          teacher: unusedTeachers[i - nextWeekDuties.length],
          date: format(addDays(nextWeekStart, i), "yyyy-MM-dd"),
        });
      }
    }
  }

  return (
    <>
      <TeacherNavbar />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-blue-700">
              Nöbetçi Öğretmen Listesi
            </h2>
            <p className="mt-3 text-xl max-md:text-sm text-gray-600">
              Hangi gün hangi öğretmen nöbetçi görebilirsiniz
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            {loading && <div>Yükleniyor...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && (
              <>
                <div className="mb-4">
                  <div className="font-semibold text-blue-700">
                    Bu Haftanın Nöbetçi Öğretmenleri
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm mb-8 min-w-[400px]">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1 whitespace-nowrap">
                          Tarih
                        </th>
                        <th className="border px-2 py-1 whitespace-nowrap">
                          Ad Soyad
                        </th>
                        <th className="border px-2 py-1 whitespace-nowrap">
                          E-posta
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filledNextWeek.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-2">
                            Kayıt yok
                          </td>
                        </tr>
                      )}
                      {filledNextWeek.map((duty) => (
                        <tr key={duty.id}>
                          <td className="border px-2 py-1 whitespace-nowrap">
                            {duty.date
                              ? format(
                                  parseISO(duty.date),
                                  "d MMMM yyyy, EEEE",
                                  {
                                    locale: tr,
                                  }
                                )
                              : "-"}
                          </td>
                          <td className="border px-2 py-1 whitespace-nowrap">
                            {duty.teacher.first_name} {duty.teacher.last_name}
                          </td>
                          <td className="border px-2 py-1 whitespace-nowrap">
                            {duty.teacher.email || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DutySchedulePage;
