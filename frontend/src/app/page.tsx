import LoginButton from "@/components/auth/login-button";

import { PiStudent } from "react-icons/pi";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function Home() {
  return (
    <main className="flex h-10/12 flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">
          Ünit Rezervasyon Sistemine Hoşgeldiniz
        </h1>
        <LoginButton>
          <PiStudent className="mr-2 h-5 w-5" />
          Öğrenci Girişi
        </LoginButton>
        <LoginButton>
          <FaChalkboardTeacher className="mr-2 h-5 w-5" />
          Öğretmen Girişi
        </LoginButton>
      </div>
    </main>
  );
}
