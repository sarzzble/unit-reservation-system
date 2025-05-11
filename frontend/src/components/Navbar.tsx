"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/units" className="text-xl font-semibold text-gray-800">
              Diş Ünitesi Rezervasyon
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/my-reservations"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Rezervasyonlarım
            </Link>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
