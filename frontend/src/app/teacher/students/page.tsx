"use client";

import React, { useState, useEffect, useRef } from "react";
import { getStudents } from "@/lib/api";
import { Student } from "@/interfaces";
import { TeacherNavbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaUserGraduate, FaSearch } from "react-icons/fa";
import Link from "next/link";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [ordering, setOrdering] = useState("first_name");
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStudents({
        search,
        student_class: studentClass,
        ordering,
      });
      setStudents(data);
    } catch {
      setError("Öğrenciler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError("");
    try {
      const searchValue = searchInputRef.current?.value || "";
      const data = await getStudents({
        search: searchValue,
        student_class: studentClass,
        ordering,
      });
      setStudents(data);
    } catch {
      setError("Öğrenciler yüklenirken bir hata oluştu");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    // Sayfa ilk açıldığında tüm öğrencileri çek
    fetchStudents();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <TeacherNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Öğrenci Listesi
              </h1>
              <p className="text-gray-600 mt-1">
                Tüm öğrenciler ve filtreleme seçenekleri
              </p>
            </div>
            <Link
              href="/teacher/reservations"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded shadow text-sm transition-colors duration-200"
            >
              Ünit Rezervasyonlarına Git
            </Link>
          </div>
          <form
            className="flex items-center gap-2 mb-6"
            onSubmit={handleSearch}
          >
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder="İsim veya numara ile ara"
                defaultValue={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-white pr-10"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <Input
              placeholder="Sınıf"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-32 bg-white"
            />
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="w-48 bg-white pr-10 border rounded h-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 placeholder:text-gray-400"
              style={{ minWidth: 0 }}
            >
              <option value="first_name">Ad (A-Z)</option>
              <option value="-first_name">Ad (Z-A)</option>
              <option value="last_name">Soyad (A-Z)</option>
              <option value="-last_name">Soyad (Z-A)</option>
              <option value="student_number">Numara (Artan)</option>
              <option value="-student_number">Numara (Azalan)</option>
              <option value="student_class">Sınıf (Artan)</option>
              <option value="-student_class">Sınıf (Azalan)</option>
            </select>
            <Button
              type="submit"
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-3 py-1.5 text-sm"
            >
              {searching ? "Aranıyor..." : "Ara"}
            </Button>
          </form>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Soyad</TableHead>
                  <TableHead>Numara</TableHead>
                  <TableHead>Sınıf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searching ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Öğrenci bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.student_number}>
                      <TableCell className="flex items-center gap-2">
                        <FaUserGraduate className="text-gray-500" />
                        {student.first_name}
                      </TableCell>
                      <TableCell>{student.last_name}</TableCell>
                      <TableCell>{student.student_number}</TableCell>
                      <TableCell>{student.student_class}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
