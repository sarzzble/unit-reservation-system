"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";
import { setCookie } from "@/lib/auth";
import { AxiosError } from "axios";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { FaUserGraduate, FaLock, FaTooth } from "react-icons/fa";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      student_number: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setLoading(true);

    try {
      const response = await login(values.student_number, values.password);

      // Token'ları cookie'ye kaydet
      setCookie("access_token", response.access, 1); // 1 gün
      setCookie("refresh_token", response.refresh, 7); // 7 gün

      // Kullanıcı bilgilerini localStorage'a kaydet (bu bilgiler UI için gerekli)
      localStorage.setItem("user", JSON.stringify(response.user));

      // Eğer yönlendirilecek sayfa varsa oraya, yoksa units sayfasına git
      const from = searchParams.get("from") || "/units";
      router.push(from);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.error ||
          "Giriş yapılırken bir hata oluştu";
        setError(errorMessage);
      } else {
        setError("Giriş yapılırken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern with Teeth */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-12 gap-4 p-4">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <FaTooth className="w-6 h-6 text-gray-600" />
            </div>
          ))}
        </div>
      </div>

      <Card className="w-[400px] shadow-xl border-0 bg-white/90 backdrop-blur-sm relative z-10">
        <CardHeader className="">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <Image
                src="/images/unit-reservation-system-logo.png"
                alt="Ünit Rezervasyon Sistemi Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold text-gray-800">
              Diş Üniti Rezervasyon Sistemi Öğrenci Girişi
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="student_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaUserGraduate className="w-4 h-4" />
                      Öğrenci Numarası
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Öğrenci numaranızı girin"
                        type="text"
                        disabled={loading}
                        autoComplete="off"
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <FaLock className="w-4 h-4" />
                      Şifre
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        type="password"
                        disabled={loading}
                        autoComplete="current-password"
                        className="focus:ring-2 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 border-red-200"
                >
                  <AlertDescription className="text-red-600 whitespace-pre-line">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="text-sm text-center text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
            >
              Kayıt olun
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Yükleniyor...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
