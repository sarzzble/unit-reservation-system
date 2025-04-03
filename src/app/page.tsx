import LoginButton from "@/components/auth/login-button";

export default function Home() {
  return (
    <main className="flex h-10/12 flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Unit Rezervasyon Sistemi</h1>
        <LoginButton>Öğrenci Girişi</LoginButton>
        <LoginButton>Öğretmen Girişi</LoginButton>
      </div>
    </main>
  );
}
