"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

export default function Home() {
  const router = useRouter();

  const handleTeacherLogin = () => {
    router.push("/teacher-login");
  };

  const handleStudentLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md">
        <div className="w-24 h-24 sm:w-32 sm:h-32 relative mb-4">
          <Image
            src="/images/unit-reservation-system-logo.png"
            alt="Ünit Rezervasyon Sistemi Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold mb-6 text-gray-800 text-center">
          Ünit Rezervasyon Sistemi
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={handleTeacherLogin}
            className="group relative w-full px-4 py-3 sm:px-6 sm:py-4 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaChalkboardTeacher className="text-lg sm:text-xl" />
              Öğretmen Girişi
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={handleStudentLogin}
            className="group relative w-full px-4 py-3 sm:px-6 sm:py-4 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaUserGraduate className="text-lg sm:text-xl" />
              Öğrenci Girişi
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
