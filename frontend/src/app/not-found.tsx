"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCookie } from "@/lib/auth";

export default function NotFound() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Sadece token'ın varlığını kontrol ediyoruz
    const token = getCookie("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleNavigation = () => {
    if (isLoggedIn) {
      router.push("/units");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="relative w-64 h-64 mb-8">
        <Image
          src="/images/not-found.png"
          alt="404 Not Found"
          fill
          className="object-contain"
          priority
        />
      </div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Üzgünüz, aradığınız sayfa bulunamadı
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
      </p>
      <Button
        onClick={handleNavigation}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
      >
        {isLoggedIn ? "Ünitlere Dön" : "Ana Sayfaya Dön"}
      </Button>
    </div>
  );
}
