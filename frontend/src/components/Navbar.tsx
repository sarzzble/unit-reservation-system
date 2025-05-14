"use client";

import { logout } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link
              href="/units"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-16 h-16">
                <Image
                  src="/images/unit-reservation-system-logo.png"
                  alt="Unit Rezervasyon Sistemi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-semibold text-gray-800">
                Ünit Rezervasyon Sistemi
              </span>
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
