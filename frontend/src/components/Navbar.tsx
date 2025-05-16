"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/auth";
import { getUserInfo } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getUserInfo();
        setIsTeacher(user.is_staff);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    try {
      logout();
      // Öğretmen/öğrenci ayrımına göre yönlendir
      router.push(isTeacher ? "/teacher-login" : "/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Dış tıklamada menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const homePath = isTeacher ? "/teacher/units" : "/units";

  return (
    <nav className="bg-white border-b-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link
              href={homePath}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-12 h-12 max-md:w-10 max-md:h-10">
                <Image
                  src="/images/unit-reservation-system-logo.png"
                  alt="Unit Rezervasyon Sistemi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg max-md:text-sm font-semibold text-gray-800">
                Ünit Rezervasyon Sistemi
              </span>
            </Link>
          </div>

          {/* Hamburger Menu */}
          <div className="sm:hidden pt-2.5">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:opacity-80 transition-opacity focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            {!isTeacher && (
              <Link
                href="/my-reservations"
                className="text-gray-800 hover:opacity-80 transition-opacity px-3 py-2 rounded-md text-sm font-medium"
              >
                Rezervasyonlarım
              </Link>
            )}
            <Link
              href="/profile"
              className="text-gray-800 hover:opacity-80 transition-opacity px-3 py-2 rounded-md text-sm font-medium"
            >
              Profilim
            </Link>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="sm:hidden absolute right-0 top-16 w-48 bg-white border shadow-lg z-50 space-y-2 rounded-br-sm rounded-bl-sm"
          >
            {!isTeacher && (
              <Link
                href="/my-reservations"
                className="block text-gray-800 px-4 py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Rezervasyonlarım
              </Link>
            )}
            <Link
              href="/profile"
              className="block text-gray-800 px-4 py-2 text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Profilim
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-br-sm rounded-bl-sm"
            >
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
