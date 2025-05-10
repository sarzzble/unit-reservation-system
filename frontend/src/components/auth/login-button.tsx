"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export default function LoginButton({ children }: LoginButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/auth/login");
  };

  return (
    <Button
      className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
